// The @auth slot is empty except while the /login interception is active.
// Required: without a default the slot 404s on any hard navigation.
export default function Default() {
  return null;
}
