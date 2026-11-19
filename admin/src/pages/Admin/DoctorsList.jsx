import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { IconChevronDown } from '../../components/ui/Icons'

const currency = '$'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'unavailable', label: 'Unavailable' },
]

// "4 years", "3", "1 Year", "2 Year" -> "4 years", "3 years", "1 year", "2 years"
const formatExperience = (value) => {
  const n = parseInt(value, 10)
  if (Number.isNaN(n)) return value ? String(value) : '—'
  return `${n} ${n === 1 ? 'year' : 'years'}`
}

const SearchIcon = (props) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' {...props}>
    <circle cx='11' cy='11' r='7' />
    <path d='m20 20-3.5-3.5' />
  </svg>
)

const CloseIcon = (props) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' {...props}>
    <path d='M6 6l12 12M18 6 6 18' />
  </svg>
)

const PlusIcon = (props) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' {...props}>
    <path d='M12 5v14M5 12h14' />
  </svg>
)

const UsersIcon = (props) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' {...props}>
    <circle cx='9' cy='8' r='3.5' />
    <path d='M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5' />
    <path d='M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.7.7 2.8 2.4 3 4.2' />
  </svg>
)

const cardClass =
  'rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.03]'

const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)

  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [speciality, setSpeciality] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [pendingId, setPendingId] = useState(null)

  useEffect(() => {
    if (!aToken) return
    let active = true
    Promise.resolve(getAllDoctors()).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken])

  const handleToggle = async (id) => {
    setPendingId(id)
    try {
      await changeAvailability(id)
    } finally {
      setPendingId(null)
    }
  }

  const specialities = useMemo(
    () => [...new Set(doctors.map((d) => d.speciality).filter(Boolean))].sort(),
    [doctors]
  )

  const counts = useMemo(() => {
    const available = doctors.filter((d) => d.available).length
    return { all: doctors.length, available, unavailable: doctors.length - available }
  }, [doctors])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return doctors.filter((d) => {
      if (speciality !== 'all' && d.speciality !== speciality) return false
      if (availability === 'available' && !d.available) return false
      if (availability === 'unavailable' && d.available) return false
      if (!q) return true
      return [d.name, d.speciality, d.email, d.degree]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    })
  }, [doctors, query, speciality, availability])

  const isFiltered = query.trim() !== '' || speciality !== 'all' || availability !== 'all'

  const clearFilters = () => {
    setQuery('')
    setSpeciality('all')
    setAvailability('all')
  }

  return (
    <div className='space-y-8'>

      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl'>Doctors</h1>
          <p className='mt-1.5 max-w-2xl text-[15px] leading-6 text-gray-500'>
            Manage registered doctors, specialities and booking availability.
          </p>
        </div>
        <Link
          to='/add-doctor'
          className='inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-medium text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:scale-[0.98] sm:w-auto'
        >
          <PlusIcon className='h-5 w-5' />
          Add doctor
        </Link>
      </div>

      <div className='@container space-y-5'>

        {/* Toolbar */}
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <div className='relative w-full sm:w-80'>
              <label htmlFor='doctor-search' className='sr-only'>Search doctors</label>
              <SearchIcon className='pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <input
                id='doctor-search'
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search by name or speciality'
                autoComplete='off'
                className='h-11 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15'
              />
              {query && (
                <button
                  type='button'
                  onClick={() => setQuery('')}
                  aria-label='Clear search'
                  className='absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20'
                >
                  <CloseIcon className='h-4 w-4' />
                </button>
              )}
            </div>

            <div className='relative w-full sm:w-56'>
              <label htmlFor='speciality-filter' className='sr-only'>Filter by speciality</label>
              <select
                id='speciality-filter'
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className='h-11 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-3.5 pr-10 text-[15px] text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15'
              >
                <option value='all'>All specialities</option>
                {specialities.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <IconChevronDown className='pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
            </div>
          </div>

          <div
            role='group'
            aria-label='Filter by availability'
            className='-mx-1 flex max-w-full overflow-x-auto px-1 lg:mx-0 lg:px-0'
          >
            <div className='inline-flex rounded-xl bg-gray-100 p-1'>
              {filters.map((f) => {
                const active = availability === f.key
                return (
                  <button
                    key={f.key}
                    type='button'
                    aria-pressed={active}
                    onClick={() => setAvailability(f.key)}
                    className={`inline-flex h-9 cursor-pointer items-center whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
                      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                    <span className='ml-1.5 tabular-nums text-gray-400'>{counts[f.key]}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Result summary */}
        {!loading && doctors.length > 0 && (
          <p aria-live='polite' className='text-sm text-gray-500'>
            Showing <span className='font-medium text-gray-700 tabular-nums'>{filtered.length}</span> of{' '}
            <span className='tabular-nums'>{doctors.length}</span> doctors
            {isFiltered && (
              <>
                {' · '}
                <button
                  type='button'
                  onClick={clearFilters}
                  className='cursor-pointer font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20'
                >
                  Clear filters
                </button>
              </>
            )}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className='grid grid-cols-1 gap-5 @lg:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${cardClass} animate-pulse overflow-hidden`}>
                <div className='aspect-[5/4] bg-gray-100' />
                <div className='space-y-3 p-5'>
                  <div className='h-5 w-2/3 rounded-md bg-gray-100' />
                  <div className='h-4 w-1/3 rounded-md bg-gray-100' />
                  <div className='h-px bg-gray-100' />
                  <div className='flex justify-between'>
                    <div className='h-4 w-1/3 rounded-md bg-gray-100' />
                    <div className='h-6 w-11 rounded-full bg-gray-100' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty: no doctors at all */}
        {!loading && doctors.length === 0 && (
          <div className={`${cardClass} flex flex-col items-center px-6 py-16 text-center`}>
            <span className='flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <UsersIcon className='h-7 w-7' />
            </span>
            <h2 className='mt-5 text-lg font-semibold text-gray-900'>No doctors yet</h2>
            <p className='mt-1.5 max-w-sm text-[15px] text-gray-500'>
              Add your first doctor to start accepting appointments.
            </p>
            <Link
              to='/add-doctor'
              className='mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-medium text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25'
            >
              <PlusIcon className='h-5 w-5' />
              Add doctor
            </Link>
          </div>
        )}

        {/* Empty: filters returned nothing */}
        {!loading && doctors.length > 0 && filtered.length === 0 && (
          <div className={`${cardClass} flex flex-col items-center px-6 py-16 text-center`}>
            <span className='flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500'>
              <SearchIcon className='h-7 w-7' />
            </span>
            <h2 className='mt-5 text-lg font-semibold text-gray-900'>No doctors match your filters</h2>
            <p className='mt-1.5 max-w-sm text-[15px] text-gray-500'>
              Try a different name or speciality, or clear the filters.
            </p>
            <button
              type='button'
              onClick={clearFilters}
              className='mt-6 inline-flex h-11 cursor-pointer items-center rounded-xl border border-gray-300 bg-white px-5 text-[15px] font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20'
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Doctors grid */}
        {!loading && filtered.length > 0 && (
          <div className='grid grid-cols-1 gap-5 @lg:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-4'>
            {filtered.map((item) => (
              <article key={item._id} className={`${cardClass} flex flex-col overflow-hidden`}>

                <div className='aspect-[5/4] overflow-hidden bg-primary/[0.06]'>
                  <img
                    src={item.image}
                    alt={item.name}
                    loading='lazy'
                    className={`h-full w-full object-cover object-top transition duration-300 ${
                      item.available ? '' : 'opacity-60 grayscale'
                    }`}
                  />
                </div>

                <div className='flex flex-1 flex-col p-5'>
                  <h2 className='truncate text-[17px] font-semibold leading-6 text-gray-900' title={item.name}>
                    {item.name}
                  </h2>
                  <p className='mt-0.5 truncate text-sm font-medium text-primary'>{item.speciality}</p>

                  <dl className='mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4'>
                    <div>
                      <dt className='text-[13px] text-gray-500'>Fee</dt>
                      <dd className='mt-0.5 text-[15px] font-medium tabular-nums text-gray-900'>
                        {currency}{item.fees}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-[13px] text-gray-500'>Experience</dt>
                      <dd className='mt-0.5 text-[15px] font-medium text-gray-900'>
                        {formatExperience(item.experience)}
                      </dd>
                    </div>
                  </dl>

                  <div className='mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4 mt-4'>
                    <span className={`text-sm font-medium ${item.available ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.available ? 'Available for booking' : 'Unavailable'}
                    </span>

                    <label className='relative inline-flex shrink-0 cursor-pointer items-center'>
                      <input
                        type='checkbox'
                        role='switch'
                        className='peer sr-only'
                        checked={!!item.available}
                        onChange={() => handleToggle(item._id)}
                        disabled={pendingId === item._id}
                        aria-label={`Booking availability for ${item.name}`}
                      />
                      <span className='h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25 peer-disabled:cursor-wait peer-disabled:opacity-60' />
                      <span className='pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5' />
                    </label>
                  </div>
                </div>

              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default DoctorsList