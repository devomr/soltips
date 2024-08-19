export type UserAvatarProps = {
  name: string;
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

export const UserAvatar: React.FC<UserAvatarProps> = ({ name }) => {
  return (
    <div className="bg-slate-600 text-white font-bold rounded-full w-16 h-16 flex items-center justify-center text-2xl">
      {extractLetters(name)}
    </div>
  );
};
