import { IconTrash } from '@tabler/icons-react';
import { SocialIcon } from '../shared/icons/social-icon';

type SocialLinkInputProps = {
  link: string;
  index: number;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
};

export function SocialLinkInput({
  link,
  index,
  onChange,
  onRemove,
}: SocialLinkInputProps) {
  return (
    <label className="input flex items-center gap-2 bg-gray-100">
      <SocialIcon url={link} size={24} />
      <input
        type="text"
        className="grow"
        placeholder="https://example.com"
        pattern="https?://.*"
        maxLength={250}
        value={link}
        onChange={(e) => onChange(index, e.target.value)}
      />
      <IconTrash
        className="cursor-pointer text-red-500"
        onClick={() => onRemove(index)}
      />
    </label>
  );
}
