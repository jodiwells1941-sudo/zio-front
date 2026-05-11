import dynamic from "next/dynamic";
import Link from "next/link";
const ClientReply = dynamic(() => import("@/components/widgets/ClientReply"));

const BlogComments = () => {
	return (
		<div className="blog__details-card-sm mt-60">
			<div className="card__intro mb-40">
				<h6 className="title-animation neutral-top fw-6">
					Comments <span className="fw-4">(525K+)</span>
				</h6>
				<div className="sort-wrapper">
					<p>Sort By:</p>

					<select name="sort" className="sort-select select" defaultValue="">
						<option value="" disabled hidden>
							Date
						</option>
						<option value="new">New</option>
						<option value="old">Old</option>
					</select>
				</div>
			</div>

			<ClientReply />

			<div className="mt-40">
				<Link
					href="blog-details"
					aria-label="view all comments"
					title="view all comments"
					className="btn--secondary"
				>
					View All Comments
				</Link>
			</div>
		</div>
	);
};

export default BlogComments;
