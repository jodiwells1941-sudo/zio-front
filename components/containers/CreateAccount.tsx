import dynamic from "next/dynamic";
import Image from "next/image";
import circle from "@/public/images/authentication/circle.png";
import thumb from "@/public/images/authentication/thumb.png";
import numbers from "@/public/images/authentication/numbers.png";

const RegisterForm = dynamic(() => import("../widgets/RegisterForm"));

const CreateAccount = () => {
	return (
		<section className="authentication py-5 pt-md-120 pb-md-120">
			<div className="container">
				<div className="row align-items-center">
					<div className="col-12 col-lg-6 col-xl-6">
						<div
							className="authentication__inner"
							data-aos="fade-right"
							data-aos-duration="600"
						>
							<div className="authentication__content  mt-md-80">
								<h4 className="title-animation neutral-top fw-6 mb-10">
									Let&apos;s Get Started!
								</h4>
								<p>Getting Started Is Easy.</p>
							</div>

							<div className="authentication__form mt-55">
								<RegisterForm />
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-6 col-xl-5 offset-xl-1">
						<div
							className="authentication__thumb text-center d-none d-lg-block"
							style={{
								backgroundImage: "url(images/authentication/thumb-sm.png)",
							}}
						>
							<div className="circle-img">
								<Image src={circle} alt="Image" />
							</div>
							<div className="thumb">
								<Image
									src={thumb}
									alt="Image"
									data-aos="zoom-in"
									data-aos-duration="600"
									data-aos-delay="200"
								/>
							</div>
							<div className="number-img">
								<Image src={numbers} alt="Image" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CreateAccount;
