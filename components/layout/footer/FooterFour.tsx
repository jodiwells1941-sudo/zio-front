import Link from "next/link";

const FooterFour = () => {
	const currentYear = new Date().getFullYear();
	return (
		<footer className="footer-two footer--alter mt-0">
			<div className="footer__copyright">
				<div className="container">
					<div className="row align-items-center gutter-20">
						<div className="col-12 col-lg-5">
							<div className="footer__copyright-content">
								<p className="text-center text-lg-start">
									Copyright &copy; <span>{currentYear}</span>{" "}
									<Link href="/">Zio Lottery</Link>. All rights reserved.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default FooterFour;
