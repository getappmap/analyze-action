let isVerbose = false;
export default function verbose(v?: string | boolean) {
  if (v === 'true' || v === true) {
    isVerbose = true;
  }
  return isVerbose;
}
