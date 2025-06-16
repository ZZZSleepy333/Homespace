"use client";

import React from "react";

interface SearchInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  id,
  label,
  value,
  onChange,
  onKeyPress,
}) => {
  return (
    <div className="w-full relative">
      <input
        id={id}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder=" "
        type="text"
        className="
          peer
          w-full
          p-4
          pt-6 
          font-light 
          bg-white 
          border-2
          rounded-md
          outline-none
          transition
          disabled:opacity-70
          disabled:cursor-not-allowed
          pl-4
          border-neutral-300
          focus:border-black
        "
      />
      <label
        className="
          absolute 
          text-md
          duration-150 
          transform 
          -translate-y-3 
          top-5 
          z-10 
          origin-[0] 
          left-4
          peer-placeholder-shown:scale-100 
          peer-placeholder-shown:translate-y-0 
          peer-focus:scale-75
          peer-focus:-translate-y-4
          text-zinc-400
        "
      >
        {label}
      </label>
    </div>
  );
};

export default SearchInput;
