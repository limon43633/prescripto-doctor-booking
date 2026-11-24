import { blogsData } from '../data/blogs'
import BlogCard from './BlogCard'

const RecentBlogs = () => {
  return (
    <section className='py-14 md:py-16'>

      {/* Section header - Centered */}
      <div className='text-center mb-8 md:mb-10 max-w-5xl mx-auto px-4'>
        <span className='inline-block bg-primary/10 text-primary text-xs font-medium px-4 py-1.5 rounded-full mb-3'>
          Recent Blogs
        </span>
        <h2 className='font-medium text-2xl sm:text-3xl text-gray-900 leading-snug'>
          Read our latest blogs from <br className='hidden sm:block' /> health experts
        </h2>
      </div>

      {/* Blog cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto px-4'>
        {blogsData.map((blog) => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>
    </section>
  )
}

export default RecentBlogs