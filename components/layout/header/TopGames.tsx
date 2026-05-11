import Link from "next/link";
import TopGamesData from "@/public/data/top-games-data";

const TopGames = () => {
	return (
		<div className="navbar__intro-games">
			<button aria-label="dropdown menu">
				<i className="ti ti-layout-grid"></i>Lottery
				<i className="ti ti-chevron-down"></i>
			</button>
			<ul className="sub-menu">
				{TopGamesData.map((item) => {
					return (
						<li key={item.id}>
							<Link href={item.path}>{item.title}</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default TopGames;
