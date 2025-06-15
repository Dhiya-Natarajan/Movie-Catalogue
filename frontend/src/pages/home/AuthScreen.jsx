import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import '../../index.css'

const AuthScreen = () => {
	const [email, setEmail] = useState("");
	const navigate = useNavigate();

	const handleFormSubmit = (e) => {
		e.preventDefault();
		navigate("/signup?email=" + email);
	};

	return (
		<div className='hero-bg relative'>
			{/* Navbar */}
			<header className='max-w-6xl mx-auto flex items-center justify-between p-4 pb-10'>
					<img 
						src='/netflix-logo.png'  
						style={{ 
							background: "transparent",
							width: "120px",
							height: "120px",
							borderRadius: "50%",
							objectFit: "cover"
  						}} 
						alt='Netflix Logo' 
						className='w-32 sm:w-40' 
						
					/>
				<Link to={"/login"} className='text-white bg-indigo-600 py-1 px-2 rounded hover:bg-indigo-700'>
					Sign In
				</Link>
			</header>

			{/* hero section */}
			<div className='flex flex-col items-center justify-center text-center py-40 text-white max-w-6xl mx-auto'>
				<h1 className='text-4xl md:text-6xl font-bold mb-4 tracking-in'>Hey, Found Your Next Watch Yet?</h1>
				<p className='text-lg mb-4'> Skip the endless scroll. We've got you</p>
				<p className='mb-4'>Join the hive — it only takes an email.</p>

				<form className='flex flex-col md:flex-row gap-4 w-1/2' onSubmit={handleFormSubmit}>
					<input
						type='email'
						placeholder='Email address'
						className='p-2 rounded flex-1 bg-black/80 border border-gray-700'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<button className='bg-indigo-600 text-xl lg:text-2xl px-2 lg:px-6 py-1 md:py-2 rounded flex justify-center items-center hover:bg-indigo-700'>
						Start Exploring
					<ChevronRight className='size-8 md:size-10' />
					</button>
				</form>
			</div>

			{/* separator */}
			<div className='h-2 w-full bg-[#232323]' aria-hidden='true' />

			{/* 1st section */}
			<div className='py-10 bg-black text-white'>
				<div className='flex max-w-6xl mx-auto items-center justify-center md:flex-row flex-col px-4 md:px-2'>
					{/* left side */}
					<div className='flex-1 text-center md:text-left'>
						<h2 className='text-4xl md:text-5xl font-extrabold mb-4'>🎥 Stay informed, always</h2>
						<p className='text-lg md:text-xl'>Get movie details anytime
						</p>
						&nbsp;
						<p>Our app lets you explore detailed information about your favorite movies — from cast and trailers to ratings and summaries</p>
					</div>
					{/* right side */}
					<div className='flex-1 relative'>
						<img src='/tv.png' alt='Tv image' className='mt-4 z-20 relative' />
						<video
							className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1/2 z-10'
							playsInline
							autoPlay={true}
							muted
							loop
						>
							<source src='/hero-vid.m4v' type='video/mp4' />
						</video>
					</div>
				</div>
			</div>

			{/* separator */}
			<div className='h-2 w-full bg-[#232323]' aria-hidden='true' />

			
			{/* 3rd section */}
			<div className='py-10 bg-black text-white'>
				<div className='flex max-w-6xl mx-auto items-center justify-center md:flex-row flex-col px-4 md:px-2'>
					{/* left side */}
					<div className='flex-1 text-center md:text-left'>
						<h2 className='text-4xl md:text-5xl font-extrabold mb-4'>🎞️ Preview the thrill</h2>
						<p className='text-lg md:text-xl'>
							Watch trailers anytime 
						</p>
						&nbsp;
						<p>
						Catch official trailers on the go — no more digging through YouTube or random links. Whether you're hyped for a blockbuster or curious about a hidden gem, we've got the trailer ready for you. Just hit play and dive in!
						</p>
					</div>

					{/* right side */}
					<div className='flex-1 relative overflow-hidden'>
						<img src='/device-pile.png' alt='Device image' className='mt-4 z-20 relative' />
						<video
							className='absolute top-2 left-1/2 -translate-x-1/2  h-4/6 z-10
               max-w-[63%] 
              '
							playsInline
							autoPlay={true}
							muted
							loop
						>
							<source src='/video-devices.m4v' type='video/mp4' />
						</video>
					</div>
				</div>
			</div>

			<div className='h-2 w-full bg-[#232323]' aria-hidden='true' />

			
		</div>
	);
};
export default AuthScreen;
