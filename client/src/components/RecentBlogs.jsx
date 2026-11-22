import { ArrowRightIcon } from 'lucide-react'
import React from 'react'

// Blog data
const blogsData = [
  {
    image: 'https://i.ibb.co.com/4wz5Pr8X/coughing-person-23-2148497373.avif',
    title: 'Typhoid Fever: Symptoms, Causes and Treatment',
    description: 'Learn about the early warning signs of typhoid, how it spreads, and treatment options.',
  },
  {
    image: 'https://i.ibb.co.com/4Zy591t3/PCOD-and-PCOS-8b2cddcc09.jpg',
    title: 'PCOS: Symptoms, Causes and Management',
    description: 'Understand the hormonal imbalance behind PCOS and lifestyle changes that help.',
  },
  {
    image: 'https://i.ibb.co.com/B21bZRT6/en3593113.jpg',
    title: 'Eczema: Symptoms, Triggers and Relief',
    description: 'Explore what causes eczema flare-ups and treatments that provide lasting relief.',
  },
  {
    image: 'https://i.ibb.co.com/LyK4TqY/Chickenpox.webp',
    title: 'Chickenpox in Children: What Parents Should Know',
    description: 'A guide to spotting chickenpox early and knowing when to see a doctor.',
  },
  {
    image: 'https://i.ibb.co.com/m5281jtj/images.jpg',
    title: 'Migraine vs Headache: How to Tell the Difference',
    description: 'Learn the key differences and when a headache needs medical attention.',
  },
  {
    image: 'https://i.ibb.co.com/MD25XGGp/images-1.jpg',
    title: 'Acid Reflux: Symptoms, Causes and Healing',
    description: 'Find out what triggers acid reflux and the changes that help you heal faster.',
  },
]

const RecentBlogs = () => {
  return (
    <section className='py-14 md:py-16'>

      {/* Section header - Centered */}
      <div className='text-center mb-8 md:mb-10 max-w-5xl mx-auto px-4'>
        <span className='inline-block bg-primary/10 text-primary text-xs font-medium px-4 py-1.5 rounded-full mb-3'>
          Recent Blogs
        </span>
        <h2 className='font-medium text-2xl sm:text-3xl text-gray-900 leading-snug mb-4'>
          Read our latest blogs from <br className='hidden sm:block' /> health experts
        </h2>

        <button className='group inline-flex items-center gap-1.5 text-sm text-primary hover:gap-2.5 transition-all'>
          View all
          <ArrowRightIcon size={16} className='transition-transform group-hover:translate-x-0.5' />
        </button>
      </div>

      {/* Blog cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto px-4'>
        {blogsData.map((blog, index) => (
          <div
            key={index}
            className='flex flex-col bg-white border border-gray-100 hover:-translate-y-1 hover:shadow-md transition duration-300 rounded-2xl p-3 shadow-sm'
          >
            <img
              className='rounded-xl h-48 w-full object-cover'
              src={blog.image}
              alt={blog.title}
            />

            <div className='flex flex-col flex-1 pt-3 pb-1 px-1'>
              <p className='text-gray-900 text-base sm:text-lg font-medium leading-snug line-clamp-2'>
                {blog.title}
              </p>
              <p className='text-zinc-500 text-xs sm:text-sm font-light mt-1.5 line-clamp-2'>
                {blog.description}
              </p>

              <span className='mt-auto pt-3 text-primary text-xs font-normal underline underline-offset-2 cursor-pointer hover:text-primary/80'>
                Read more
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RecentBlogs