import Link from "next/link";
import Image from "next/image";
import thumb from "@/public/images/privacy.png";

const PrivacySection = () => {
	return (
		<section className="privacy pt-120 pb-120">
			<div className="container">
				<div className="row gutter-40">
					<div className="col-12 col-xl-8">
						<div className="blog__details-card">
							<div className="details__poster">
								<Image src={thumb} alt="Image" />
							</div>
							<div className="details__content mt-55" id="privacyCategory">
								<h4 className="title-animation neutral-top fw-6">
									Information We Collect
								</h4>
								<p className="mt-20">
									Lorem Ipsum is simply dummy text of the printing and
									typesetting industry. Lorem Ipsum has been the industry&apos;s
									standard dummy text ever since the 1500s, when an unknown
									printer took a galley of type and scrambled it to make a type
									specimen book.
								</p>
								<p className="mt-20">
									It has survived not only five centuries, but also the leap
									into electronic versions of Lorem Ipsum typesetting, remaining
									essentially unchanged.
								</p>
								<p className="mt-20">
									It was popularised in the 1960s with the release of Letraset
									sheets containing Lorem Ipsum passages, and more recently with
									desktop publishing software like Aldus PageMaker including
								</p>
							</div>
							<div className="details__content mt-35 mb-40">
								<hr className="divider" />
							</div>
							<div className="details__content" id="privacyInformation">
								<h5 className="title-animation neutral-top fw-6">
									How We Use Your Information
								</h5>
								<p className="mt-20">
									Lorem Ipsum is simply dummy text of the printing and
									typesetting industry. Lorem Ipsum has been the industry&apos;s
									standard dummy text ever since the 1500s, when an unknown
									printer took a galley of type and scrambled it to make a type
									specimen book.
								</p>
								<p className="mt-20">
									It has survived not only five centuries, but also the leap
									into electronic versions of Lorem Ipsum typesetting, remaining
									essentially unchanged.
								</p>
								<p className="mt-20">
									It was popularised in the 1960s with the release of Letraset
									sheets containing Lorem Ipsum passages, and more recently with
									desktop publishing software like Aldus PageMaker including
								</p>
							</div>
							<div className="details__content mt-35 mb-40">
								<hr className="divider" />
							</div>
							<div className="details__content" id="privacyShare">
								<h6 className="title-animation neutral-top fw-6">
									Information Sharing and Disclosure
								</h6>
								<p className="mt-20">
									Lorem Ipsum is simply dummy text of the printing and
									typesetting industry. Lorem Ipsum has been the industry&apos;s
									standard dummy text ever since the 1500s, when an unknown
									printer took a galley of type and scrambled it to make a type
									specimen book.
								</p>
								<p className="mt-20">
									It has survived not only five centuries, but also the leap
									into electronic versions of Lorem Ipsum typesetting, remaining
									essentially unchanged.
								</p>
								<p className="mt-20">
									It was popularised in the 1960s with the release of Letraset
									sheets containing Lorem Ipsum passages, and more recently with
									desktop publishing software like Aldus PageMaker including
								</p>
							</div>
							<div className="details__content mt-35 mb-40">
								<hr className="divider" />
							</div>
							<div className="details__content" id="privacyRights">
								<h6 className="title-animation text-xl neutral-top fw-6">
									Your Rights and Choices
								</h6>
								<p className="mt-20">
									Lorem Ipsum is simply dummy text of the printing and
									typesetting industry. Lorem Ipsum has been the industry&apos;s
									standard dummy text ever since the 1500s, when an unknown
									printer took a galley of type and scrambled it to make a type
									specimen book.
								</p>
								<p className="mt-20">
									It has survived not only five centuries, but also the leap
									into electronic versions of Lorem Ipsum typesetting, remaining
									essentially unchanged.
								</p>
								<p className="mt-20">
									It was popularised in the 1960s with the release of Letraset
									sheets containing Lorem Ipsum passages, and more recently with
									desktop publishing software like Aldus PageMaker including
								</p>
							</div>
							<div className="details__content mt-35 mb-40">
								<hr className="divider" />
							</div>
							<div className="details__content" id="privacySecurity">
								<h6 className="title-animation text-xl neutral-top fw-6">
									Security Measures
								</h6>
								<p className="mt-20">
									Lorem Ipsum is simply dummy text of the printing and
									typesetting industry. Lorem Ipsum has been the industry&apos;s
									standard dummy text ever since the 1500s, when an unknown
									printer took a galley of type and scrambled it to make a type
									specimen book.
								</p>
								<p className="mt-20">
									It has survived not only five centuries, but also the leap
									into electronic versions of Lorem Ipsum typesetting, remaining
									essentially unchanged.
								</p>
								<p className="mt-20">
									It was popularised in the 1960s with the release of Letraset
									sheets containing Lorem Ipsum passages, and more recently with
									desktop publishing software like Aldus PageMaker including
								</p>
							</div>
							<div className="details__content mt-35 mb-40">
								<hr className="divider" />
							</div>
							<div className="details__content details__footer">
								<div className="details-tag">
									<div className="tag-header">
										<p>
											Popular Tags <i className="ti ti-arrow-move-right"></i>
										</p>
									</div>
									<div className="tag-wrapper">
										<Link href="blog">Crypto</Link>
										<Link href="blog">Casino</Link>
									</div>
								</div>
								<div className="details-tag">
									<div className="tag-header">
										<p>
											Follow <i className="ti ti-arrow-move-right"></i>
										</p>
									</div>
									<div className="social">
										<Link
											href="https://www.facebook.com/"
											target="_blank"
											aria-label="share us on facebook"
											title="facebook"
										>
											<i className="fa-brands fa-facebook-f"></i>
										</Link>
										<Link
											href="https://instagram.com/"
											target="_blank"
											aria-label="share us on instagram"
											title="instagram"
										>
											<i className="fa-brands fa-instagram"></i>
										</Link>
										<Link
											href="https://x.com/"
											target="_blank"
											aria-label="share us on twitter"
											title="twitter"
										>
											<i className="fa-brands fa-twitter"></i>
										</Link>
										<Link
											href="https://www.linkedin.com/"
											target="_blank"
											aria-label="share us on linkedin"
											title="linkedin"
										>
											<i className="fa-brands fa-linkedin-in"></i>
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-12 col-xl-4">
						<div className="privacy__sidebar blog__sidebar-widget">
							<Link href="#privacyCategory" className="privacy-btn active">
								<i className="ti ti-hand-finger"></i>All Categories
							</Link>
							<Link href="#privacyInformation" className="privacy-btn">
								<i className="ti ti-info-circle"></i>Use of Information
							</Link>
							<Link href="#privacyShare" className="privacy-btn">
								<i className="ti ti-share"></i>Sharing & Disclosure
							</Link>
							<Link href="#privacyRights" className="privacy-btn">
								<i className="ti ti-user"></i>User Rights
							</Link>
							<Link href="#privacySecurity" className="privacy-btn">
								<i className="ti ti-lock"></i>Security Practices
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default PrivacySection;
