import { useState, useEffect } from 'react'
import { Stethoscope, Baby, Brain, Flower2, Scan, HeartPulse } from 'lucide-react'

// Speciality data
const specialitiesData = [
  {
    name: 'General physician',
    icon: Stethoscope,
    image: 'https://i.ibb.co.com/1fb0DMjQ/medium-shot-doctor-checking-blood-pressure-female-patient-1098-19334.avif',
    description: 'Your first point of contact for everyday health concerns and ongoing care.',
    conditions: ['Fever and infections', 'Diabetes management', 'Hypertension', 'Routine health checkups'],
  },
  {
    name: 'Gynecologist',
    icon: Flower2,
    image: 'https://i.ibb.co.com/S4j4YLMN/images.jpg',
    description: "Specialized care for women's reproductive health at every life stage.",
    conditions: ['Prenatal and pregnancy care', 'Menstrual disorders', 'PCOS and hormonal issues', 'Routine gynae screening'],
  },
  {
    name: 'Dermatologist',
    icon: Scan,
    image: 'https://i.ibb.co.com/fG2Fy8MD/dermatologist.jpg',
    description: 'Diagnosis and treatment for skin, hair, and nail conditions.',
    conditions: ['Acne and scarring', 'Eczema and psoriasis', 'Hair loss', 'Allergic skin reactions'],
  },
  {
    name: 'Pediatricians',
    icon: Baby,
    image: 'https://i.ibb.co.com/JRZLz248/tungart7-pediatrician-10172911-1280.webp',
    description: 'Complete healthcare for infants, children, and adolescents.',
    conditions: ['Growth and development', 'Vaccinations', 'Childhood infections', 'Nutrition guidance'],
  },
  {
    name: 'Neurologist',
    icon: Brain,
    image: 'https://i.ibb.co.com/5gThPzQg/Neurologist.webp',
    description: 'Treatment for disorders of the brain, spine, and nervous system.',
    conditions: ['Migraines and headaches', 'Epilepsy and seizures', 'Nerve pain', 'Memory disorders'],
  },
  {
    name: 'Gastroenterologist',
    icon: HeartPulse,
    image: 'https://i.ibb.co.com/qMVxxTVy/Gastroenterologist.jpg',
    description: 'Care for the digestive system, from stomach to liver.',
    conditions: ['Acid reflux and ulcers', 'IBS and digestive issues', 'Liver conditions', 'Chronic abdominal pain'],
  },
]

const CareBySpeciality = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isImageLoaded, setIsImageLoaded] = useState(true)
  const active = specialitiesData[activeIndex]
  const ActiveIcon = active.icon

  // Preload all images on mount
  useEffect(() => {
    specialitiesData.forEach((item) => {
      const img = new Image()
      img.src = item.image
    })
  }, [])

  // Handle smooth transition when changing tab
  const handleTabChange = (index) => {
    if (index === activeIndex) return
    setIsImageLoaded(false)
    setActiveIndex(index)
  }

  return (
    <section className='py-14 md:py-16'>

      {/* Section header */}
      <div className='text-center mb-10 md:mb-12 px-4 '>
        <span className='inline-block bg-primary/10 text-primary text-xs font-medium px-4 py-1.5 rounded-full mb-4'>
          Know your care
        </span>
        <h2 className='font-medium text-2xl sm:text-3xl text-gray-900 mb-3'>
          Care by speciality
        </h2>
        <p className='text-gray-500 text-sm max-w-md mx-auto'>
          Not sure which doctor to book? Here's what each speciality actually treats.
        </p>
      </div>

      <div className='max-w-5xl mx-auto px-4'>

        {/* Tabs */}
        <div className='flex gap-2 mb-8 md:mb-10 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center flex-nowrap md:flex-wrap'>
          {specialitiesData.map((speciality, index) => {
            const Icon = speciality.icon
            const isActive = activeIndex === index

            return (
              <button
                key={index}
                onClick={() => handleTabChange(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-primary/40 hover:text-primary'
                }`}
              >
                <Icon size={16} strokeWidth={1.6} />
                {speciality.name}
              </button>
            )
          })}
        </div>

        {/* Card */}
        <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>
          <div className='grid grid-cols-1 md:grid-cols-2'>

            {/* Image with fade */}
            <div className='h-52 sm:h-60 md:h-auto md:min-h-[420px] overflow-hidden bg-gray-100 relative'>
              <img
                key={active.image} // forces re-render for transition
                src={active.image}
                alt={active.name}
                onLoad={() => setIsImageLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>

            {/* Content */}
            <div className='p-6 sm:p-8 md:p-10 flex flex-col justify-center'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
                  <ActiveIcon size={18} strokeWidth={1.6} />
                </div>
                <h3 className='text-xl sm:text-2xl md:text-3xl font-light text-gray-800'>
                  {active.name}
                </h3>
              </div>

              <p className='text-sm sm:text-base text-gray-600 leading-relaxed mb-6'>
                {active.description}
              </p>

              <p className='text-xs font-medium text-gray-400 tracking-wider uppercase mb-3'>
                Commonly Treated
              </p>

              <div className='flex flex-col gap-2.5'>
                {active.conditions.map((condition, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <span className='w-1.5 h-1.5 rounded-full bg-primary shrink-0' />
                    <span className='text-sm text-gray-600'>{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CareBySpeciality