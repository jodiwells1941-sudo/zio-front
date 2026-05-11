import { handlePopupSearch } from "@/actions/full-search";

interface SearchPopupProps {
	onClose: () => void;
}

const SearchPopup = ({ onClose }: SearchPopupProps) => {
	return (
		<div className="search-popup">
			<button
				className="close-search"
				aria-label="close search box"
				title="close search box"
				onClick={onClose}
			>
				<i className="fa-solid fa-xmark"></i>
			</button>
			<form action={handlePopupSearch}>
				<div className="search-popup__group">
					<input
						type="text"
						name="search-field"
						id="searchField"
						placeholder="Search...."
						required
					/>
					<button
						type="submit"
						aria-label="search products"
						title="search products"
					>
						<i className="fa-solid fa-magnifying-glass"></i>
					</button>
				</div>
			</form>
		</div>
	);
};

export default SearchPopup;
