import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Link2,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { motion, useScroll, MotionConfig, useReducedMotion } from 'motion/react'
import { toast } from 'react-toastify'
import { blogsData, getBlogBySlug, calculateReadingTime, BLOG_DISCLAIMER } from '../data/blogs'
import BlogCard from '../components/BlogCard'

const BlogDetails = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const blog = useMemo(() => getBlogBySlug(slug), [slug])

  const [failedSlugs, setFailedSlugs] = useState({})
  const [activeHeading, setActiveHeading] = useState('')

  const imgError = Boolean(failedSlugs[slug])

  const { scrollYProgress } = useScroll()
  const prefersReducedMotion = useReducedMotion()

  // Scroll to top on mount or slug change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // Set document title and meta description; restore on unmount
  useEffect(() => {
    if (!blog) return
    const prevTitle = document.title
    document.title = `${blog.title} | Prescripto`

    let metaDesc = document.querySelector('meta[name="description"]')
    let created = false
    let prevDesc = ''
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
      created = true
    } else {
      prevDesc = metaDesc.getAttribute('content') || ''
    }
    metaDesc.setAttribute('content', blog.excerpt)

    return () => {
      document.title = prevTitle
      if (created && metaDesc.parentNode) {
        metaDesc.parentNode.removeChild(metaDesc)
      } else if (metaDesc) {
        metaDesc.setAttribute('content', prevDesc)
      }
    }
  }, [blog])

  // Extract H2 sections for the sticky TOC
  const h2Sections = useMemo(() => {
    if (!blog?.content) return []
    return blog.content
      .filter((block) => block.type === 'h2')
      .map((block, idx) => ({
        id: `section-${idx}`,
        text: block.text,
      }))
  }, [blog])

  // IntersectionObserver to highlight active TOC heading
  useEffect(() => {
    if (!h2Sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveHeading(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    h2Sections.forEach((sec) => {
      const el = document.getElementById(sec.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [h2Sections])

  const formattedDate = useMemo(() => {
    if (!blog?.publishedAt) return ''
    const date = new Date(blog.publishedAt)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [blog])

  const readingTime = blog ? calculateReadingTime(blog) : 1

  const relatedBlogs = useMemo(() => {
    if (!blog) return []
    const others = blogsData.filter((b) => b.slug !== blog.slug)
    const diffCat = others.filter((b) => b.category !== blog.category)
    const sameCat = others.filter((b) => b.category === blog.category)
    return [...diffCat, ...sameCat].slice(0, 3)
  }, [blog])

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied')
    } catch {
      toast.error('Unable to copy link')
    }
  }

  // Handle unknown slug (not found state)
  if (!blog) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto px-4">
        <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
          Health Editorial
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Article not found</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The article you are looking for doesn't exist or may have been moved. Browse our latest health articles written by health experts.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
        >
          Return to home
        </Link>
      </div>
    )
  }

  // Track h2 indexing during content block rendering
  let h2Index = 0

  return (
    <MotionConfig reducedMotion="user">
      {/* 3px Reading Progress Bar at top of viewport */}
      {!prefersReducedMotion && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-50 origin-left"
          style={{ scaleX: scrollYProgress }}
        />
      )}

      <article className="pt-6 pb-16">
        {/* Top row: Back navigation link */}
        <div className="max-w-5xl mx-auto mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg py-1 px-1 -ml-1 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 motion-reduce:transform-none" />
            <span>Back</span>
          </button>
        </div>

        {/* Header Block */}
        <header className="max-w-5xl mx-auto">
          <div className="max-w-[720px]">
            <Link
              to={`/doctors/${encodeURIComponent(blog.category)}`}
              className="inline-block bg-primary/10 hover:bg-primary/15 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {blog.category}
            </Link>

            <h1 className="text-3xl sm:text-4xl lg:text-[50px] font-bold text-gray-900 leading-[1.15] tracking-tight text-balance">
              {blog.title}
            </h1>

            <p className="text-[18px] sm:text-[20px] leading-relaxed text-gray-600 mt-4">
              {blog.excerpt}
            </p>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 select-none shadow-sm"
                  aria-hidden="true"
                >
                  P
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{blog.author}</span>
                  <span className="text-gray-300" aria-hidden="true">·</span>
                  <time dateTime={blog.publishedAt}>{formattedDate}</time>
                  <span className="text-gray-300" aria-hidden="true">·</span>
                  <span>{readingTime} min read</span>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleCopyLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Copy article link"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-primary hover:bg-gray-50 border border-gray-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Link2 className="w-4 h-4" />
                <span className="hidden sm:inline">Copy link</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="w-full max-w-5xl mx-auto my-8 sm:my-10">
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full aspect-[16/10] lg:aspect-[2/1] rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-sm"
          >
            {!imgError ? (
              <img
                src={blog.image}
                alt={blog.title}
                fetchPriority="high"
                loading="eager"
                onError={() => setFailedSlugs((prev) => ({ ...prev, [slug]: true }))}
                className="w-full h-full object-cover"
                style={{ objectPosition: blog.imagePosition || 'center' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10 text-primary p-6 text-center">
                <span className="text-lg font-semibold">{blog.category}</span>
                <span className="text-sm text-gray-600 mt-1">{blog.title}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Article Body: Two-column grid on lg+, single column on smaller */}
        <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 items-start">
          {/* Sticky TOC Column on lg+ */}
          <aside className="hidden lg:block sticky top-24 self-start w-[220px]">
            <nav aria-label="On this page" className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                On this page
              </p>
              <ul className="space-y-1.5 text-sm">
                {h2Sections.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className={`block py-1.5 px-2.5 rounded-lg transition-colors leading-snug ${
                        activeHeading === sec.id
                          ? 'font-semibold text-primary bg-primary/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                      }`}
                    >
                      {sec.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Article Text Content Column */}
          <div className="max-w-[720px] text-gray-700 leading-[1.8] text-[17px] lg:text-[18px]">
            {blog.content.map((block, index) => {
              // Lead paragraph
              if (index === 0 && block.type === 'p') {
                return (
                  <React.Fragment key={index}>
                    <p className="text-[19px] sm:text-[20px] leading-relaxed text-gray-800 font-normal mb-8">
                      {block.text}
                    </p>

                    {/* Key Takeaways Callout right after the lead paragraph */}
                    {blog.takeaways && blog.takeaways.length > 0 && (
                      <motion.div
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 16 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-2xl bg-primary/[0.06] border border-primary/15 p-6 sm:p-7 my-8"
                      >
                        <div className="flex items-center gap-2.5 mb-3 text-primary font-semibold text-lg">
                          <Sparkles className="w-5 h-5 shrink-0" />
                          <span>Key takeaways</span>
                        </div>
                        <ul className="space-y-2.5">
                          {blog.takeaways.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 text-[15px] sm:text-[16px] text-gray-700 leading-normal"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </React.Fragment>
                )
              }

              // Heading 2
              if (block.type === 'h2') {
                const secId = `section-${h2Index++}`
                return (
                  <h2
                    key={index}
                    id={secId}
                    className="text-2xl sm:text-[28px] lg:text-[30px] font-semibold text-gray-900 mt-12 mb-4 tracking-tight scroll-mt-28"
                  >
                    {block.text}
                  </h2>
                )
              }

              // Standard Paragraph
              if (block.type === 'p') {
                return (
                  <p key={index} className="mb-5">
                    {block.text}
                  </p>
                )
              }

              // Unordered List
              if (block.type === 'ul') {
                return (
                  <ul key={index} className="my-5 space-y-2.5 pl-1">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              }

              // Callout
              if (block.type === 'callout') {
                const isWarning = block.variant === 'warning'
                return (
                  <motion.div
                    key={index}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 16 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`rounded-2xl p-6 sm:p-7 my-8 border ${
                      isWarning
                        ? 'bg-amber-50/90 border-amber-200/90 text-amber-950'
                        : 'bg-primary/[0.05] border-primary/15 text-gray-800'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 font-semibold text-lg mb-3 ${
                        isWarning ? 'text-amber-800' : 'text-primary'
                      }`}
                    >
                      {isWarning ? (
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                      ) : (
                        <Info className="w-5 h-5 shrink-0" />
                      )}
                      <span>{block.title}</span>
                    </div>

                    {block.text && (
                      <p className="text-[15px] sm:text-[16px] leading-relaxed mb-3">
                        {block.text}
                      </p>
                    )}

                    {block.items && (
                      <ul className="space-y-2 text-[15px] sm:text-[16px]">
                        {block.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                                isWarning ? 'bg-amber-600' : 'bg-primary'
                              }`}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )
              }

              return null
            })}

            {/* Medical Disclaimer Note */}
            <div className="border-t border-gray-100 pt-6 mt-12 text-xs sm:text-[13px] text-gray-500 leading-relaxed italic">
              {BLOG_DISCLAIMER}
            </div>
          </div>
        </div>

        {/* Doctor CTA Card */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl bg-primary text-white p-8 sm:p-12 my-14 max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Talk to a {blog.category} specialist
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Connect with verified, board-certified specialists on Prescripto for personalized medical advice and tailored care.
            </p>
          </div>
          <Link
            to={`/doctors/${encodeURIComponent(blog.category)}`}
            className="h-12 min-h-[44px] px-8 rounded-full bg-white text-primary font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98]"
          >
            Find a {blog.category} doctor
          </Link>
        </motion.div>

        {/* "Keep reading" Related Articles */}
        {relatedBlogs.length > 0 && (
          <div className="max-w-5xl mx-auto my-14 pt-10 border-t border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8">
              Keep reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedBlogs.map((b) => (
                <BlogCard key={b.slug} blog={b} />
              ))}
            </div>
          </div>
        )}
      </article>
    </MotionConfig>
  )
}

export default BlogDetails
