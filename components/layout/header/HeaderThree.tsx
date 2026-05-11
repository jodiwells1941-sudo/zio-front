import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo.png";

const HeaderThree = () => {
	return (
		<header className="d-flex p-3 border-bottom border-secondary border-opacity-25">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="main-header__menu-box">
							<nav className="navbar p-0">
								<div className="navbar-logo">
									<Link href="/">
										<Image width={130} height={130} src={logo} alt="Image" />
									</Link>
								</div>
								<div className="authentication__intro d-none d-md-block">
									<Link
										href="/"
										aria-label="back to home"
										title="back to home"
										className="btn--primary"
									>
										<i className="ti ti-arrow-narrow-left"></i>Back To Home
									</Link>
								</div>
								<div className="authentication__intro d-md-none">
									<Link
										href="/"
										aria-label="back to home"
										title="back to home"
										// className="btn--primary"
									>
										<i className="ti ti-arrow-narrow-left"></i>Back To Home
									</Link>
								</div>
							</nav>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default HeaderThree;
