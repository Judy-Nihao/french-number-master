import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { getFrenchRepresentation } from "../src/utils/frenchConverter";

// Local CLI only: this file is never imported by the website.
const main = async () => {
  const args = process.argv.slice(2);
  const numberIndex = args.indexOf("--number");
  const input = numberIndex >= 0 ? args[numberIndex + 1] : undefined;
  if (!input || !/^\d+$/.test(input))
    throw new Error("Specify one number: --number 0. Add --generate to call the paid API.");
  const number = Number(input);
  if (!Number.isInteger(number) || number < 0 || number > 100)
    throw new Error("This local audio script accepts integers from 0 to 100.");

  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const v3 = args.includes("--v3");
  const modelId = v3 ? "eleven_v3" : process.env.ELEVENLABS_MODEL_ID;
  if (voiceId !== "BVBq6HVJVdnwOMJOqvy9" || (!v3 && modelId !== "eleven_multilingual_v2"))
    throw new Error("Set the agreed voice ID and eleven_multilingual_v2 in .env.local.");
  const numeric = args.includes("--numeric");
  const phrase = args.includes("--phrase");
  if (numeric && phrase) throw new Error("Choose either --numeric or --phrase.");
  const word = getFrenchRepresentation(number).word;
  const text = phrase ? `Le nombre ${word}.` : numeric ? String(number) : word;
  const directory = path.resolve("assets/audio-generated/fr-FR/v1");
  const takeIndex = args.indexOf("--take");
  const take = takeIndex >= 0 ? args[takeIndex + 1] : undefined;
  if (takeIndex >= 0 && (!take || !/^[1-9]\d*$/.test(take)))
    throw new Error("Use a positive take number, for example --take 2.");
  const baseKey = phrase ? `${number}-phrase` : numeric ? `${number}-numeric` : String(number);
  const modelKey = v3 ? `${baseKey}-v3` : baseKey;
  const fileKey = take ? `${modelKey}-take${take}` : modelKey;
  const target = path.join(directory, `${fileKey}.mp3`);
  console.log(JSON.stringify({ number, text, voiceId, modelId, characters: text.length, target }, null, 2));
  if (!args.includes("--generate")) {
    console.log("Preview only. No API request was made.");
    return;
  }
  if (await stat(target).then((file) => file.size > 0).catch(() => false)) {
    console.log("Existing audio found; skipped to avoid generating it twice.");
    return;
  }
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is missing from .env.local.");

  // One request, no automatic retries: a retry may consume credits again.
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: modelId, ...(v3 ? { language_code: "fr" } : {}) }),
      signal: AbortSignal.timeout(60_000),
    },
  );
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`ElevenLabs returned HTTP ${response.status}. No audio was saved; no retry was attempted.`);
  }
  if (!response.headers.get("content-type")?.startsWith("audio/")) {
    await response.body?.cancel();
    throw new Error("The provider did not return audio. No file was saved.");
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const isMp3 = bytes.subarray(0, 3).toString("ascii") === "ID3" ||
    (bytes.length > 1 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  if (!isMp3) throw new Error("The response does not look like a complete MP3 file. No file was saved.");
  await mkdir(directory, { recursive: true });
  await writeFile(`${target}.part`, bytes, { flag: "wx" });
  await rename(`${target}.part`, target);

  const manifestPath = path.join(directory, "manifest.json");
  let manifest: { audios: Record<string, unknown> } = { audios: {} };
  try { manifest = JSON.parse(await readFile(manifestPath, "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  manifest.audios[fileKey] = {
    number, text, file: `${fileKey}.mp3`, voiceId, modelId, format: "mp3_44100_128",
    ...(v3 ? { languageCode: "fr" } : {}),
    bytes: bytes.length, generatedAt: new Date().toISOString(), source: "ElevenLabs AI-generated speech",
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Saved ${bytes.length} bytes to ${target}`);
};

main().catch((error: unknown) => {
  // Never print credentials, request headers or provider response bodies.
  console.error(error instanceof Error ? error.message : "Audio generation failed.");
  process.exitCode = 1;
});
