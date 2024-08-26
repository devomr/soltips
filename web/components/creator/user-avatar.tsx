export type UserAvatarProps = {
  name: string;
  imageUrl?: string;
};

function extractLetters(name: string): string {
  // Split the input string into words based on spaces
  const words = name.split(' ');

  // Take up to the first two words
  const firstTwoWords = words.slice(0, 2);

  // Map each word to its first letter and join them into a single string
  const firstLetters = firstTwoWords
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return firstLetters;
}

export const UserAvatar = ({ name, imageUrl }: UserAvatarProps) => {
  // If an image URL is provided, use it; otherwise, extract letters from the name
  const avatarContent = imageUrl ? (
    <div className="avatar rounded-full border-2 border-white drop-shadow">
      <div className="w-24 rounded-full">
        <img src={imageUrl} alt={name} />
      </div>
    </div>
  ) : (
    <div className="avatar placeholder">
      <div className="bg-neutral text-neutral-content w-24 rounded-full border-2 border-white drop-shadow">
        <span className="text-3xl">{extractLetters(name)}</span>
      </div>
    </div>
  );

  return avatarContent;
};
