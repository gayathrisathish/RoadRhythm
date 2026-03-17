/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: "/api/predict",
				destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/predict`,
			},
		];
	},
};

export default nextConfig;
