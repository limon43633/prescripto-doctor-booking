import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const BlogCard = ({ blog, className = '' }) => {
  if (!blog) return null

  return (
    <Link
      to={`/blog/${blog.slug}`}
      className={`group flex flex-col bg-white border border-gray-100 hover:-translate-y-1 hover:shadow-md transition duration-300 rounded-2xl p-3 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
    >
      <img
        className="rounded-xl h-48 w-full object-cover"
        src={blog.image}
        alt={blog.title}
        loading="lazy"
        style={{ objectPosition: blog.imagePosition || 'center' }}
      />

      <div className="flex flex-col flex-1 pt-3 pb-1 px-1">
        <h3 className="text-gray-900 text-base sm:text-lg font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {blog.title}
        </h3>
        <p className="text-zinc-500 text-xs sm:text-sm font-light mt-1.5 line-clamp-2">
          {blog.excerpt || blog.description}
        </p>

        <div className="mt-auto pt-3 flex items-center gap-1.5 text-primary text-xs font-medium">
          <span className="underline underline-offset-2">Read more</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" />
        </div>
      </div>
    </Link>
  )
}

export default BlogCard
