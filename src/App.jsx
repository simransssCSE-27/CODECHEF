
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Clock3,
  Search,
  X,
  Plus,
  Pencil,
  Trash2,
  Users,
  LayoutDashboard,
  LogOut,
  ChefHat,
} from 'lucide-react'
import cowMascot from './assets/cow-mascot.jpg'
import chefMascot from './assets/chef.jpg'
import './App.css'

const initialEvents = [
  {
    id: 1,
    name: 'Code & Curry Hackathon',
    category: 'Hackathon',
    date: '2026-10-10',
    time: '10:00 AM',
    venue: 'ABES Engineering College',
    description:
      'Bring your ideas to life by collaborating with fellow students and building innovative solutions.',
  },
  {
    id: 2,
    name: 'Design Your First App',
    category: 'Workshop',
    date: '2026-10-17',
    time: '11:00 AM',
    venue: 'ABES Engineering College',
    description:
      'Explore UI/UX fundamentals and learn how to turn your ideas into simple app designs.',
  },
  {
    id: 3,
    name: 'AI Ideas Lab',
    category: 'Competition',
    date: '2026-10-24',
    time: '10:30 AM',
    venue: 'ABES Engineering College',
    description:
      'Explore artificial intelligence through creative challenges and practical ideas.',
  },
]

const emptyEvent = {
  name: '',
  category: 'Workshop',
  date: '',
  time: '',
  venue: '',
  description: '',
}

const ingredients = [
  { symbol: '🍅', x: 9, y: 24, delay: '0s' },
  { symbol: '🌿', x: 85, y: 17, delay: '0.5s' },
  { symbol: '🥕', x: 91, y: 48, delay: '1s' },
  { symbol: '🧄', x: 12, y: 76, delay: '1.5s' },
  { symbol: '🌶️', x: 82, y: 82, delay: '0.8s' },
]

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const formatDate = (date) => {
  if (!date) return 'Date not set'

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [events, setEvents] = useState(() =>
    readStorage('cochef-events', initialEvents),
  )
  const [registrations, setRegistrations] = useState(() =>
    readStorage('cochef-registrations', []),
  )
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [message, setMessage] = useState('')
  const [admin, setAdmin] = useState(false)
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [eventForm, setEventForm] = useState(emptyEvent)
  const [registrationSearch, setRegistrationSearch] = useState('')
  const [ingredientPointer, setIngredientPointer] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('cochef-events', JSON.stringify(events))
    } catch (error) {
      console.error('Could not save events:', error)
    }
  }, [events])

  useEffect(() => {
    try {
      localStorage.setItem(
        'cochef-registrations',
        JSON.stringify(registrations),
      )
    } catch (error) {
      console.error('Could not save registrations:', error)
    }
  }, [registrations])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = (
        `${event.name} ${event.description} ${event.venue}`
      )
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesCategory =
        category === 'All' || event.category === category

      return matchesSearch && matchesCategory
    })
  }, [events, search, category])

  const openRegistration = (event) => {
    setSelectedEvent(event)
    setForm({ name: '', email: '', phone: '' })
    setMessage('')
  }

  const register = (e) => {
    e.preventDefault()
    if (!selectedEvent) return

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()

    if (!name) {
      setMessage('Please enter your full name.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address.')
      return
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage('Enter a valid 10-digit Indian mobile number.')
      return
    }

    const duplicate = registrations.some(
      (r) =>
        r.eventId === selectedEvent.id &&
        r.email.toLowerCase() === email,
    )

    if (duplicate) {
      setMessage('This email is already registered for this event.')
      return
    }

    setRegistrations((previous) => [
      ...previous,
      {
        id: Date.now(),
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        name,
        email,
        phone,
        registeredAt: new Date().toISOString(),
      },
    ])

    setMessage('Registration successful!')
    setForm({ name: '', email: '', phone: '' })
  }

  const login = (e) => {
    e.preventDefault()

    if (password === 'cochef-admin') {
      setAdminLoggedIn(true)
      setPassword('')
      setMessage('')
    } else {
      setMessage('Incorrect demo password.')
    }
  }

  const resetEventForm = () => {
    setEditingId(null)
    setEventForm({ ...emptyEvent })
  }

  const saveEvent = (e) => {
    e.preventDefault()

    if (editingId !== null) {
      setEvents((previous) =>
        previous.map((event) =>
          event.id === editingId
            ? { ...eventForm, id: editingId }
            : event,
        ),
      )
    } else {
      setEvents((previous) => [
        ...previous,
        { ...eventForm, id: Date.now() },
      ])
    }

    resetEventForm()
  }

  const editEvent = (event) => {
    setEditingId(event.id)
    setEventForm({
      name: event.name,
      category: event.category,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteEvent = (id) => {
    if (!window.confirm('Delete this event?')) return

    setEvents((previous) => previous.filter((event) => event.id !== id))
    setRegistrations((previous) =>
      previous.filter((registration) => registration.eventId !== id),
    )

    if (editingId === id) resetEventForm()
  }

  const categories = [
    'All',
    ...new Set(events.map((event) => event.category)),
  ]

  const handleIngredientPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return

    const rect = e.currentTarget.getBoundingClientRect()
    setIngredientPointer({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  if (admin) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <a href="#home" className="logo">
            <span className="logo-icon">
              <ChefHat size={22} />
            </span>
            <span>
              Co<span className="red">Chef</span>
            </span>
          </a>

          <button
            className="secondary-button"
            onClick={() => {
              setAdmin(false)
              setAdminLoggedIn(false)
              setMessage('')
              resetEventForm()
            }}
          >
            <X size={17} /> Close
          </button>
        </header>

        {!adminLoggedIn ? (
          <form className="admin-login" onSubmit={login}>
            <div className="admin-login-icon">
              <ChefHat size={32} />
            </div>
            <h2>Admin Login</h2>
            <p>Sign in to manage events and registrations.</p>

            <input
              type="password"
              placeholder="Demo password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {message && (
              <p className="form-message error-message" role="alert">
                {message}
              </p>
            )}

            <button className="primary-button" type="submit">
              Login <ArrowUpRight size={18} />
            </button>
            <small>Demo password: cochef-admin</small>
          </form>
        ) : (
          <main className="admin-content">
            <div className="admin-title">
              <div>
                <span className="section-label">CONTROL PANEL</span>
                <h1>Admin Dashboard</h1>
                <p>Manage your events and view student registrations.</p>
              </div>

              <button
                className="secondary-button"
                onClick={() => {
                  setAdminLoggedIn(false)
                  resetEventForm()
                }}
              >
                <LogOut size={17} /> Log out
              </button>
            </div>

            <div className="admin-stats">
              <article className="admin-stat">
                <div className="stat-icon">
                  <CalendarDays size={23} />
                </div>
                <span>Total events</span>
                <strong>{events.length}</strong>
              </article>

              <article className="admin-stat">
                <div className="stat-icon">
                  <Users size={23} />
                </div>
                <span>Registrations</span>
                <strong>{registrations.length}</strong>
              </article>
            </div>

            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-label">EVENT MANAGEMENT</span>
                  <h2>{editingId !== null ? 'Edit Event' : 'Add New Event'}</h2>
                </div>
              </div>

              <form className="event-form" onSubmit={saveEvent}>
                <label>
                  Event name
                  <input
                    placeholder="Enter event name"
                    value={eventForm.name}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, name: e.target.value })
                    }
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Category
                  <select
                    value={eventForm.category}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        category: e.target.value,
                      })
                    }
                  >
                    <option>Workshop</option>
                    <option>Hackathon</option>
                    <option>Competition</option>
                    <option>Seminar</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Event date
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Event time
                  <input
                    placeholder="e.g. 10:00 AM"
                    value={eventForm.time}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, time: e.target.value })
                    }
                    required
                  />
                </label>

                <label className="full-width">
                  Venue
                  <input
                    placeholder="Enter venue"
                    value={eventForm.venue}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, venue: e.target.value })
                    }
                    required
                  />
                </label>

                <label className="full-width">
                  Event description
                  <textarea
                    placeholder="Describe the event..."
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    maxLength={500}
                    rows={4}
                    required
                  />
                </label>

                <div className="form-actions full-width">
                  <button className="primary-button" type="submit">
                    {editingId !== null ? 'Save Changes' : 'Add Event'}
                    <Plus size={17} />
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetEventForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-label">YOUR SCHEDULE</span>
                  <h2>Manage Events</h2>
                </div>
                <span className="count-badge">{events.length} events</span>
              </div>

              {events.length === 0 ? (
                <p className="admin-empty">No events added yet.</p>
              ) : (
                events.map((event) => (
                  <div className="admin-event" key={event.id}>
                    <div className="admin-event-info">
                      <span className="event-category">{event.category}</span>
                      <strong>{event.name}</strong>
                      <p>
                        {formatDate(event.date)} · {event.time}
                      </p>
                    </div>

                    <div className="admin-actions">
                      <button
                        className="icon-button"
                        onClick={() => editEvent(event)}
                        aria-label={`Edit ${event.name}`}
                        title="Edit event"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => deleteEvent(event.id)}
                        aria-label={`Delete ${event.name}`}
                        title="Delete event"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-label">STUDENT DATA</span>
                  <h2>Registrations</h2>
                </div>
                <span className="count-badge">
                  {registrations.length} students
                </span>
              </div>

              <div className="registration-search">
                <Search size={18} />
                <input
                  placeholder="Search by name, email or event"
                  value={registrationSearch}
                  onChange={(e) => setRegistrationSearch(e.target.value)}
                />
              </div>

              {registrations
                .filter((r) =>
                  `${r.name} ${r.email} ${r.eventName}`
                    .toLowerCase()
                    .includes(registrationSearch.toLowerCase()),
                )
                .map((r) => (
                  <div className="admin-event" key={r.id}>
                    <div className="admin-event-info">
                      <strong>{r.name}</strong>
                      <p>{r.email} · {r.phone}</p>
                      <small>{r.eventName}</small>
                    </div>
                  </div>
                ))}

              {registrations.length === 0 && (
                <p className="admin-empty">No registrations yet.</p>
              )}

              {registrations.length > 0 &&
                !registrations.some((r) =>
                  `${r.name} ${r.email} ${r.eventName}`
                    .toLowerCase()
                    .includes(registrationSearch.toLowerCase()),
                ) && (
                  <p className="admin-empty">
                    No registrations match your search.
                  </p>
                )}
            </section>
          </main>
        )}
      </div>
    )
  }

  return (
    <>
      {showWelcome && (
        <div className="welcome-screen">
          <div className="welcome-card">
            <div className="welcome-illustration">
              <img
                src={chefMascot}
                alt="CoChef chef mascot"
                className="welcome-chef"
              />
            </div>
            <div className="welcome-copy">
              <p className="welcome-intro">Welcome to the</p>
              <h1 className="welcome-title">Kitchen, Champ!</h1>
              <p className="welcome-subtitle">
                Ready to cook up some amazing ideas? 🚀
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="app">
        <header className="navbar">
          <a href="#home" className="logo">
            <span className="logo-icon">♨</span>
            <span>
              Co<span className="red">Chef</span>
            </span>
          </a>

          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#events">Upcoming Events</a>
          </nav>

          <span className="college-label">
            <span className="college-dot" />
            ABES ENGINEERING COLLEGE
          </span>
        </header>

        <main>
          <section className="hero" id="home">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                A STUDENT-LED COMMUNITY
              </div>

              <h1>
                Ideas cook
                <br />
                best <span>together.</span>
              </h1>

              <p className="hero-description">
                Discover events, workshops and competitions.
                Learn, build and meet people who share your curiosity.
              </p>

              <a href="#events" className="primary-button">
                Explore Events <ArrowUpRight size={18} />
              </a>

              <div className="hero-footnote">
                <span className="footnote-line" />
                LEARN · BUILD · CONNECT
              </div>
            </div>

            <div
              className="hero-art"
              onPointerMove={handleIngredientPointerMove}
              onPointerLeave={() => setIngredientPointer(null)}
            >
              {ingredients.map((ingredient, index) => {
                const dx = ingredient.x - (ingredientPointer?.x ?? -1000)
                const dy = ingredient.y - (ingredientPointer?.y ?? -1000)
                const distance = Math.hypot(dx, dy)
                const force =
                  ingredientPointer && distance < 30
                    ? (1 - distance / 30) * 20
                    : 0
                const moveX = distance ? (dx / distance) * force : 0
                const moveY = distance ? (dy / distance) * force : 0

                return (
                  <span
                    className="ingredient-particle"
                    key={`${ingredient.symbol}-${index}`}
                    aria-hidden="true"
                    style={{
                      left: `${ingredient.x}%`,
                      top: `${ingredient.y}%`,
                      '--particle-x': `${moveX}px`,
                      '--particle-y': `${moveY}px`,
                    }}
                  >
                    <span
                      className="ingredient-particle-symbol"
                      style={{ animationDelay: ingredient.delay }}
                    >
                      {ingredient.symbol}
                    </span>
                  </span>
                )
              })}
              <div className="art-circle" />
              <div className="art-spark">✳</div>
              <img
                src={cowMascot}
                alt="CoChef cow mascot"
                className="cow-mascot"
              />
              <span className="art-caption">Made with curiosity.</span>
            </div>
          </section>

          <section className="about-section" id="about">
            <span className="section-label">ABOUT COCHEF</span>
            <h2>
              A community built around <span>ideas.</span>
            </h2>
            <p>
              CoChef brings students together through workshops,
              hackathons and competitions. It creates opportunities
              to explore interests, develop practical skills and
              collaborate with fellow students.
            </p>
            <p>
              From learning something new to turning an idea into
              reality, every experience is an opportunity to grow.
            </p>
          </section>

          <section className="events-section" id="events">
            <div className="events-heading">
              <span className="section-label">WHAT'S NEXT</span>
              <h2>
                Upcoming Events<span>.</span>
              </h2>
              <p className="events-intro">
                Find your next opportunity to learn, create and connect.
              </p>
            </div>

            <div className="event-tools">
              <div className="search-box">
                <Search size={18} />
                <input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="category-filters">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`filter-button ${category === item ? 'active' : ''}`}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="event-grid">
              {filteredEvents.map((event) => (
                <article className="event-card" key={event.id}>
                  <span className="event-category">{event.category}</span>
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>

                  <div className="event-details">
                    <span>
                      <CalendarDays size={16} />
                      {formatDate(event.date)}
                    </span>
                    <span>
                      <Clock3 size={16} />
                      {event.time}
                    </span>
                    <span>
                      <MapPin size={16} />
                      {event.venue}
                    </span>
                  </div>

                  <button
                    className="event-register"
                    onClick={() => openRegistration(event)}
                  >
                    Register Now <ArrowUpRight size={17} />
                  </button>
                </article>
              ))}

              {filteredEvents.length === 0 && (
                <p className="empty-events">
                  No events match your search. Try another keyword or category.
                </p>
              )}
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <span>
            Co<span className="red">Chef</span> · ABES Engineering College
          </span>
          <button
            className="footer-admin"
            onClick={() => {
              setAdmin(true)
              setMessage('')
            }}
          >
            <LayoutDashboard size={16} /> Admin
          </button>
        </footer>
      </div>

      {selectedEvent && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedEvent(null)}
        >
          <section
            className="registration-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
          >
            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close registration"
            >
              <X />
            </button>

            <span className="section-label">EVENT REGISTRATION</span>
            <h2 id="registration-title">{selectedEvent.name}</h2>
            <p className="modal-event-date">
              {formatDate(selectedEvent.date)} · {selectedEvent.time}
            </p>

            <form onSubmit={register} className="registration-form">
              <label>
                Full name
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  required
                  maxLength={80}
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Mobile number
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                  placeholder="10-digit mobile number"
                  required
                  maxLength={10}
                />
              </label>

              {message && (
                <p
                  className={`form-message ${
                    message === 'Registration successful!'
                      ? 'success-message'
                      : 'error-message'
                  }`}
                  role="status"
                >
                  {message}
                </p>
              )}

              <button className="primary-button" type="submit">
                Submit Registration <ArrowUpRight size={18} />
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  )
}

export default App