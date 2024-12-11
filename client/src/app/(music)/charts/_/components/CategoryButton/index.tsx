import { memo } from "react";
import { IoIosArrowDown } from "react-icons/io";

import styles from "./styles.module.scss";

export const CategoryButton = memo(function CategoryButton({
  selectedCategory,
  showDropdown,
  toggleDropdown,
}: {
  selectedCategory: string;
  showDropdown: boolean;
  toggleDropdown: () => void;
}) {
  return (
    <div onClick={toggleDropdown} className={styles.dropdown}>
      <IoIosArrowDown className={showDropdown ? styles.dropdownIconOpen : styles.dropdownIcon} />
      <p>{selectedCategory.split("-chart")[0]}</p>
    </div>
  );
});
