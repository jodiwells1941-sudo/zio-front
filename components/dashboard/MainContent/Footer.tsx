import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer
            className="footer"
            style={{ backgroundImage: "url('/images/footer/footer-bg-two.png')" }}
        >
            <div className="container">
                {/* Copyright */}
                <div className="footer__copyright">
                    <div className="row align-items-center">
                        <div className="col-12 text-center">
                            <p>
                                Copyright © {year} <Link href="/" className="text-worning">Lottery</Link>. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
