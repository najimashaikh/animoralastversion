import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  Clapperboard,
  ExternalLink,
  Film,
  Layers3,
  Menu,
  MoveUpRight,
  Play,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

const navItems = [
  ['Home', '#home'],
  ['Library', '#library'],
  ['Courses', '#courses'],
  ['Tutorials', '#tutorials'],
  ['Problem Solving', '#problems'],
  ['About Us', '#about'],
  ['Contact', '#contact'],
];

const categories = [
  { key: '2D', title: '2D animation', text: 'Timing, posing, drawing and movement with a point of view.', tone: 'bg-[#e2e5a9]', mark: '02 / FRAME', icon: Film },
  { key: '3D', title: '3D animation', text: 'Build dimensional worlds from first blockout to final render.', tone: 'bg-[#c3e12c]', mark: '03 / SPACE', icon: Layers3 },
  { key: 'VFX', title: 'Visual effects', text: 'Composite, simulate and finish images that feel impossible.', tone: 'bg-[#d7d4c8]', mark: 'VX / SIGNAL', icon: Sparkles },
];

const courses = [
  ['2D', 'Fundamentals of 2D Animation'],
  ['2D', 'Principles of Animation'],
  ['2D', 'Character Animation'],
  ['2D', 'Storyboarding'],
  ['2D', 'Digital Illustration'],
  ['2D', 'Motion Graphics'],
  ['3D', 'Introduction to 3D Animation'],
  ['3D', '3D Modeling Fundamentals'],
  ['3D', 'Texturing and Materials'],
  ['3D', 'Character Rigging'],
  ['3D', '3D Character Animation'],
  ['3D', 'Lighting and Rendering'],
  ['3D', 'Environment Design'],
  ['VFX', 'Introduction to VFX'],
  ['VFX', 'Compositing Fundamentals'],
  ['VFX', 'Green Screen / Chroma Key'],
  ['VFX', 'Motion Tracking'],
  ['VFX', 'Particle Effects'],
  ['VFX', 'Cinematic Effects'],
  ['VFX', 'Color Grading'],
].map(([category, title], index) => ({
  id: `course-${index + 1}`,
  category,
  level: index < 6 ? 'FOUNDATION' : index < 13 ? 'INTERMEDIATE' : 'WORKSHOP',
  title,
  desc: category === '2D'
    ? 'Build a clear visual language through timing, drawing, posing and intentional movement.'
    : category === '3D'
      ? 'Develop dimensional thinking from first blockout through camera, light, material and motion.'
      : 'Learn the craft of compositing, simulation and finishing for images that feel fully realized.',
  meta: `${index % 3 + 6} lessons  ·  ${index % 2 ? '4h 20m' : '3h 40m'}`,
  visual: category,
}));

const tutorials = [
  { id: 'tut-1', title: 'Making a walk cycle read', category: '2D', time: '14 MIN', color: 'bg-[#d7d4c8]' },
  { id: 'tut-2', title: 'A cleaner camera track', category: 'VFX', time: '09 MIN', color: 'bg-[#c3e12c]' },
  { id: 'tut-3', title: 'Light before texture', category: '3D', time: '18 MIN', color: 'bg-[#e2e5a9]' },
  { id: 'tut-4', title: 'Designing a useful animatic', category: '2D', time: '11 MIN', color: 'bg-[#c9d1c0]' },
];

const problems = [
  ['My animation feels floaty', 'Start with the contact. Clarify where the weight lands, then let the spacing between poses do the talking.'],
  ['My render feels flat', 'Separate the image into a key, a fill and a reason for the shadows. Contrast is a storytelling tool before it is a technical one.'],
  ['My composite looks pasted on', 'Track the world, not just the subject. Match grain, light direction and the small imperfections that make a plate feel lived-in.'],
];

function SectionHeading({ eyebrow, title, detail, inverse = false }: { eyebrow: string; title: string; detail?: string; inverse?: boolean }) {
  return (
    <div className={`flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${inverse ? 'text-[#eff0dc]' : ''}`}>
      <div>
        <p className={`font-mono-custom text-[10px] uppercase tracking-[.28em] ${inverse ? 'text-[#c3e12c]' : 'text-[#68731f]'}`}>{eyebrow}</p>
        <h2 className="font-display mt-3 max-w-3xl text-4xl font-semibold leading-[.98] tracking-[-.055em] md:text-6xl">{title}</h2>
      </div>
      {detail && <p className={`max-w-sm text-sm leading-6 ${inverse ? 'text-[#adb4a4]' : 'text-[#5f655c]'}`}>{detail}</p>}
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [tutorialFilter, setTutorialFilter] = useState('ALL');
  const [expandedProblem, setExpandedProblem] = useState(0);
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');

  const filteredCourses = courseFilter === 'ALL' ? courses : courses.filter((course) => course.category === courseFilter);
  const filteredTutorials = tutorialFilter === 'ALL' ? tutorials : tutorials.filter((tutorial) => tutorial.category === tutorialFilter);
  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };

  return (
    <main className="grain overflow-hidden bg-[#ececdf] text-[#172520]">
      {notice && <div data-testid="status-notice" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#c3e12c] px-5 py-3 text-xs font-bold shadow-xl">{notice}</div>}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#d0d2c3]/70 bg-[#ececdf]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1380px] items-center justify-between px-5 md:px-10">
          <a data-testid="link-brand" href="#home" className="group flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#172520] text-[#c3e12c] transition-transform group-hover:rotate-45"><span className="h-2.5 w-2.5 rounded-full border-2 border-current" /></span>
            <span className="font-display text-[13px] font-bold tracking-[.12em]">ANIMORA <span className="text-[#7c862a]">/</span> STUDIO</span>
          </a>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
            {navItems.map(([label, href]) => <a data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} key={label} href={href} className="text-[11px] font-semibold uppercase tracking-[.11em] text-[#4c554d] transition-colors hover:text-[#7a8816]">{label}</a>)}
            <button data-testid="button-login" onClick={() => showNotice('The member portal is being prepared.')} className="rounded-full border border-[#172520] px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] transition-colors hover:bg-[#172520] hover:text-[#eef0df]">Login</button>
          </nav>
          <button data-testid="button-mobile-menu" aria-label="Toggle navigation menu" onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center rounded-full border border-[#afb4a4] lg:hidden">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menuOpen && <div className="border-t border-[#d0d2c3] bg-[#ececdf] px-5 pb-5 pt-3 lg:hidden">
          {navItems.map(([label, href]) => <a data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMenuOpen(false)} key={label} href={href} className="block border-b border-[#d0d2c3] py-3 text-xs font-bold uppercase tracking-[.12em]">{label}</a>)}
          <button data-testid="button-mobile-login" onClick={() => { setMenuOpen(false); showNotice('The member portal is being prepared.'); }} className="mt-4 w-full rounded-full bg-[#172520] py-3 text-xs font-bold uppercase tracking-[.12em] text-[#eef0df]">Login</button>
        </div>}
      </header>

      <section id="home" className="relative min-h-[820px] border-b border-[#cfd1c1] bg-[#172520] pt-[74px] text-[#eff0dc]">
        <div className="absolute inset-0 opacity-40 line-grid" />
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-[#c3e12c]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1380px] items-center gap-12 px-5 py-20 md:px-10 lg:grid-cols-[.93fr_1.07fr] lg:gap-10 lg:py-28">
          <div className="reveal max-w-2xl">
            <div className="mb-10 flex items-center gap-3 font-mono-custom text-[10px] uppercase tracking-[.28em] text-[#c3e12c]"><span className="h-px w-8 bg-[#c3e12c]" /> DIGITAL LEARNING / 001</div>
            <h1 data-testid="text-hero-title" className="font-display text-[clamp(3.8rem,9vw,8.8rem)] font-semibold leading-[.81] tracking-[-.08em]">ANIMORA<br /><span className="text-[#c3e12c]">STUDIO</span><br />LIBRARY</h1>
            <p className="mt-10 font-display text-2xl tracking-[-.03em] md:text-3xl">Explore. Create. Animate.</p>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#b6bdad]">A curated digital learning and resource library for 2D Animation, 3D Animation and Visual Effects.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a data-testid="button-explore-library" href="#library" className="group flex items-center gap-5 rounded-full bg-[#c3e12c] px-5 py-3 text-xs font-bold uppercase tracking-[.11em] text-[#172520]">Explore Library <ArrowDownRight size={16} className="transition-transform group-hover:translate-y-1 group-hover:translate-x-1" /></a>
              <a data-testid="button-start-learning" href="#courses" className="flex items-center gap-3 rounded-full border border-[#768174] px-5 py-3 text-xs font-bold uppercase tracking-[.11em] text-[#eff0dc] transition-colors hover:border-[#c3e12c] hover:text-[#c3e12c]">Start Learning <ArrowRight size={15} /></a>
            </div>
          </div>
          <div className="reveal reveal-delay-2 relative mx-auto w-full max-w-[670px]">
            <div className="drift relative aspect-[1.12] overflow-hidden rounded-[2rem] border border-[#68766d] bg-[#25392e] shadow-2xl shadow-black/30">
              <img src="/animora-hero.jpg" alt="Animation workstation with wireframe and compositing visuals" className="absolute inset-0 h-full w-full object-cover opacity-75 mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#172520] via-transparent to-[#c3e12c]/20" />
              <div className="absolute left-5 top-5 font-mono-custom text-[9px] leading-4 text-[#c3e12c]">LIVE VIEW<br />RENDER 04.27<br />FPS 24.00</div>
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <p className="font-mono-custom text-[10px] uppercase tracking-[.18em] text-[#e3e8d1]">MOTION / LIGHT / MATTER</p>
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#c3e12c] text-[#c3e12c]"><Play size={16} fill="currentColor" /></span>
              </div>
              <div className="absolute right-7 top-16 h-32 w-32 rounded-full border border-[#c3e12c]/50" />
              <div className="absolute right-20 top-28 h-2 w-2 rounded-full bg-[#c3e12c] shadow-[0_0_0_7px_rgba(195,225,44,.15)]" />
            </div>
            <p className="mt-4 flex justify-between font-mono-custom text-[9px] uppercase tracking-[.2em] text-[#879286]"><span>Professional practice, made accessible</span><span>Scroll to explore ↓</span></p>
          </div>
        </div>
      </section>

      <section id="library" className="mx-auto max-w-[1380px] px-5 py-24 md:px-10 md:py-32">
        <SectionHeading eyebrow="01 / THE LIBRARY" title="A sharper way to learn the craft." detail="Not a content warehouse. A considered collection of lessons, experiments and answers for when you are ready to make the next frame." />
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {categories.map(({ key, title, text, tone, mark, icon: Icon }, index) => <button data-testid={`card-category-${key.toLowerCase()}`} onClick={() => { document.getElementById('courses')?.scrollIntoView(); setCourseFilter(key); }} key={key} className={`group relative min-h-[300px] overflow-hidden rounded-3xl p-6 text-left ${tone} transition-transform duration-500 hover:-translate-y-2 ${index === 1 ? 'md:translate-y-8' : ''}`}>
            <div className="flex items-start justify-between"><span className="font-mono-custom text-[10px] font-bold tracking-[.16em]">{mark}</span><Icon size={24} strokeWidth={1.5} /></div>
            <div className="absolute -right-8 bottom-10 h-40 w-40 rounded-full border border-[#172520]/20 transition-transform duration-700 group-hover:scale-125" />
            <div className="absolute bottom-6 left-6 right-6"><h3 className="font-display text-3xl font-semibold tracking-[-.06em]">{title}</h3><p className="mt-3 max-w-xs text-sm leading-5 text-[#435148]">{text}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em]">Browse {key} <ArrowRight size={14} /></span></div>
          </button>)}
        </div>
      </section>

      <section className="border-y border-[#ced0c0] bg-[#dedfcf]">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-20 md:grid-cols-[.9fr_1.1fr] md:px-10 md:py-28">
          <div><p className="font-mono-custom text-[10px] uppercase tracking-[.28em] text-[#68731f]">A FIELD GUIDE</p><h2 className="font-display mt-4 max-w-md text-5xl font-semibold leading-[.9] tracking-[-.07em] md:text-7xl">Learn across the whole frame.</h2></div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 self-end text-sm leading-6 text-[#586159]"><div><p className="mb-2 font-mono-custom text-2xl text-[#172520]">01</p><p>Principles over presets. Understand why a shot works before you learn how it was made.</p></div><div><p className="mb-2 font-mono-custom text-2xl text-[#172520]">02</p><p>Small studies that become a body of work, one intentional decision at a time.</p></div></div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-[1380px] px-5 py-24 md:px-10 md:py-32">
        <SectionHeading eyebrow="02 / FEATURED COURSES" title="Structured room to go deeper." detail="Choose a direction, keep your hands moving. Each course pairs a clear practice with the context to make it yours." />
        <div className="mt-10 flex flex-wrap gap-2">
          {['ALL', '2D', '3D', 'VFX'].map((filter) => <button data-testid={`button-course-filter-${filter.toLowerCase()}`} key={filter} onClick={() => setCourseFilter(filter)} className={`rounded-full border px-4 py-2 font-mono-custom text-[10px] tracking-[.16em] transition-colors ${courseFilter === filter ? 'border-[#172520] bg-[#172520] text-[#eff0dc]' : 'border-[#b8bcae] text-[#697168] hover:border-[#172520]'}`}>{filter}</button>)}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {filteredCourses.map((course) => <article data-testid={`card-course-${course.id}`} key={course.id} className="group overflow-hidden rounded-3xl border border-[#c9ccbd] bg-[#f2f2e7]">
            <div className={`relative h-56 overflow-hidden ${course.visual === '2D' ? 'bg-[#333e38]' : course.visual === '3D' ? 'bg-[#9da991]' : 'bg-[#3d4842]'}`}>
              <img src="/animora-art.jpg" alt="" className="h-full w-full object-cover opacity-65 mix-blend-screen transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172520]/80 to-transparent" />
              <span className="absolute left-5 top-5 rounded-full border border-white/30 px-3 py-1 font-mono-custom text-[9px] tracking-[.18em] text-white">{course.level}</span>
              <span className="absolute bottom-5 left-5 font-mono-custom text-[10px] tracking-[.18em] text-[#c3e12c]">{course.visual} / COURSE</span>
              <button data-testid={`button-play-course-${course.id}`} aria-label={`Preview ${course.title}`} onClick={() => showNotice(`Preview queued: ${course.title}`)} className="absolute bottom-4 right-5 grid h-11 w-11 place-items-center rounded-full bg-[#c3e12c] text-[#172520] transition-transform hover:scale-110"><Play size={15} fill="currentColor" /></button>
            </div>
            <div className="p-6"><h3 className="font-display text-2xl font-semibold tracking-[-.05em]">{course.title}</h3><p className="mt-3 text-sm leading-5 text-[#626a62]">{course.desc}</p><div className="mt-6 flex items-center justify-between border-t border-[#d5d6ca] pt-4 font-mono-custom text-[10px] text-[#70766d]"><span>{course.meta}</span><button data-testid={`button-open-course-${course.id}`} onClick={() => showNotice(`Course details selected: ${course.title}`)} className="flex items-center gap-1 font-bold text-[#172520]">VIEW <ArrowRight size={13} /></button></div></div>
          </article>)}
        </div>
      </section>

      <section id="tutorials" className="bg-[#172520] px-5 py-24 text-[#eff0dc] md:px-10 md:py-32">
        <div className="mx-auto max-w-[1380px]">
          <SectionHeading inverse eyebrow="03 / FEATURED TUTORIALS" title="Quick studies. Real breakthroughs." detail="When you need one clean answer, start here. Short, focused tutorials for the middle of the process." />
          <div className="mt-10 flex flex-wrap gap-2">
            {['ALL', '2D', '3D', 'VFX'].map((filter) => <button data-testid={`button-tutorial-filter-${filter.toLowerCase()}`} key={filter} onClick={() => setTutorialFilter(filter)} className={`rounded-full border px-4 py-2 font-mono-custom text-[10px] tracking-[.16em] transition-colors ${tutorialFilter === filter ? 'border-[#c3e12c] bg-[#c3e12c] text-[#172520]' : 'border-[#53635a] text-[#adb6a7] hover:border-[#c3e12c]'}`}>{filter}</button>)}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {filteredTutorials.map((tutorial, index) => <button data-testid={`card-tutorial-${tutorial.id}`} key={tutorial.id} onClick={() => showNotice(`Playing tutorial: ${tutorial.title}`)} className="group flex items-center gap-5 rounded-2xl border border-[#3a4c41] bg-[#1e3028] p-4 text-left transition-colors hover:border-[#c3e12c]">
              <div className={`relative grid h-28 w-36 shrink-0 place-items-center overflow-hidden rounded-xl ${tutorial.color}`}><span className="absolute inset-0 opacity-35 line-grid" /><span className="relative grid h-10 w-10 place-items-center rounded-full border border-[#172520] text-[#172520] transition-transform group-hover:scale-110"><Play size={13} fill="currentColor" /></span><span className="absolute bottom-2 left-2 font-mono-custom text-[9px] font-bold text-[#172520]">{String(index + 1).padStart(2, '0')}</span></div>
              <div className="min-w-0 flex-1"><div className="flex justify-between gap-4 font-mono-custom text-[9px] tracking-[.16em] text-[#a8b3a5]"><span>{tutorial.category} / TUTORIAL</span><span>{tutorial.time}</span></div><h3 className="mt-3 font-display text-xl font-medium tracking-[-.04em] text-[#eff0dc]">{tutorial.title}</h3><span className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#c3e12c]">Watch now <ArrowRight size={13} /></span></div>
            </button>)}
          </div>
        </div>
      </section>

      <section id="problems" className="mx-auto max-w-[1380px] px-5 py-24 md:px-10 md:py-32">
        <SectionHeading eyebrow="04 / PROBLEM SOLVING" title="Stuck is a useful place to start." detail="Name the friction. Find the principle. Move the work forward with a little more intention." />
        <div className="mt-14 grid gap-12 md:grid-cols-[.8fr_1.2fr]">
          <div><div className="font-display text-[9rem] font-semibold leading-none tracking-[-.11em] text-[#c3e12c]">?</div><p className="max-w-xs text-sm leading-6 text-[#606960]">A growing collection of practical answers to the problems that show up between the first idea and the final frame.</p></div>
          <div className="border-t border-[#bfc3b3]">{problems.map(([question, answer], index) => <div key={question} className="border-b border-[#bfc3b3]"><button data-testid={`button-problem-${index}`} onClick={() => setExpandedProblem(expandedProblem === index ? -1 : index)} className="flex w-full items-center justify-between gap-4 py-6 text-left"><span className="font-display text-2xl font-medium tracking-[-.045em]">{question}</span><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#9ea69b] transition-transform ${expandedProblem === index ? 'rotate-45 bg-[#172520] text-[#c3e12c]' : ''}`}><Plus size={15} /></span></button>{expandedProblem === index && <p className="max-w-xl pb-6 pr-12 text-sm leading-6 text-[#606960]">{answer}</p>}</div>)}</div>
        </div>
      </section>

      <section className="border-y border-[#cfd1c1] bg-[#c3e12c]">
        <div className="mx-auto grid max-w-[1380px] gap-12 px-5 py-20 md:grid-cols-[1fr_1.1fr] md:px-10 md:py-28">
          <div><p className="font-mono-custom text-[10px] uppercase tracking-[.28em] text-[#59621d]">05 / WATCH & DISCOVER</p><h2 className="font-display mt-4 max-w-lg text-5xl font-semibold leading-[.88] tracking-[-.08em] md:text-7xl">See how a thought becomes a frame.</h2><button data-testid="button-view-playlist" onClick={() => showNotice('The discovery reel is ready for your next session.')} className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#172520] px-5 py-3 text-xs font-bold uppercase tracking-[.11em] text-[#eef0df]">View discovery reel <ExternalLink size={14} /></button></div>
          <div className="relative min-h-[300px] overflow-hidden rounded-3xl bg-[#172520] p-6 text-[#eff0dc]"><div className="absolute inset-0 opacity-40 line-grid" /><div className="relative flex h-full flex-col justify-between"><div className="flex items-start justify-between"><span className="font-mono-custom text-[10px] tracking-[.2em] text-[#c3e12c]">ANIMORA SELECTS / 07</span><span className="rounded-full border border-[#72836e] px-3 py-1 font-mono-custom text-[9px]">04:12</span></div><div><p className="font-display max-w-md text-3xl leading-[.95] tracking-[-.06em]">The details are where the image starts to breathe.</p><div className="mt-6 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#c3e12c] text-[#172520]"><Play size={16} fill="currentColor" /></span><span className="font-mono-custom text-[9px] uppercase tracking-[.2em] text-[#aeb9a9]">Play / 01</span></div></div></div></div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-[1380px] px-5 py-24 md:px-10 md:py-32">
        <SectionHeading eyebrow="06 / ABOUT US" title="A studio library for curious makers." detail="Animora is a shared starting point for people who want to understand the image, not just reproduce the effect." />
        <div className="mt-16 grid gap-12 md:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-[350px] overflow-hidden rounded-3xl bg-[#273a31] p-7 text-[#eff0dc]"><img src="/animora-art.jpg" alt="Abstract collage of animation materials" className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-screen" /><div className="relative flex h-full flex-col justify-between"><p className="font-mono-custom text-[10px] tracking-[.22em] text-[#c3e12c]">THE PEOPLE BEHIND THE LIBRARY</p><p className="font-display max-w-sm text-3xl leading-none tracking-[-.06em]">Different practices.<br />One generous table.</p></div></div>
          <div className="grid content-center grid-cols-2 gap-x-6 gap-y-0 border-t border-[#bfc3b3]">{['Vaishnavi Galande', 'Swamini Bhaskar', 'Shreya Abhang', 'Shruti Kadlag', 'Najima Shaikh', 'Payal Satpute'].map((name, index) => <div data-testid={`text-team-member-${index}`} key={name} className="flex items-center justify-between border-b border-[#bfc3b3] py-5 font-display text-lg tracking-[-.04em]"><span>{name}</span><span className="font-mono-custom text-[10px] text-[#8b9388]">0{index + 1}</span></div>)}</div>
        </div>
      </section>

      <section id="contact" className="bg-[#dedfcf] px-5 py-24 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[.95fr_1.05fr] md:items-end">
          <div><p className="font-mono-custom text-[10px] uppercase tracking-[.28em] text-[#68731f]">07 / CONTACT</p><h2 className="font-display mt-4 max-w-xl text-5xl font-semibold leading-[.88] tracking-[-.08em] md:text-7xl">Bring a question.<br /><span className="text-[#7d891b]">Leave with a direction.</span></h2></div>
          <form onSubmit={(event) => { event.preventDefault(); if (email) { showNotice('You are on the Animora list.'); setEmail(''); } }} className="rounded-3xl bg-[#172520] p-7 text-[#eff0dc] md:p-10"><p className="font-display text-2xl tracking-[-.04em]">Get the occasional good thing.</p><p className="mt-2 max-w-sm text-sm leading-6 text-[#adb6a7]">New studies, useful references and a reason to open your animation software.</p><div className="mt-8 flex gap-2 border-b border-[#657267] pb-2"><input data-testid="input-contact-email" aria-label="Email address" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#778479]" /><button data-testid="button-contact-submit" type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#c3e12c] text-[#172520] transition-transform hover:scale-110"><ArrowRight size={16} /></button></div><p className="mt-5 flex items-center gap-2 font-mono-custom text-[9px] uppercase tracking-[.16em] text-[#829084]"><Check size={13} className="text-[#c3e12c]" /> No noise. Just the good stuff.</p></form>
        </div>
      </section>

      <footer className="bg-[#172520] px-5 py-12 text-[#eff0dc] md:px-10">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-col gap-10 border-b border-[#3c4b42] pb-12 md:flex-row md:items-end md:justify-between"><div><a data-testid="link-footer-brand" href="#home" className="font-display text-2xl font-semibold tracking-[-.05em]">ANIMORA <span className="text-[#c3e12c]">STUDIO LIBRARY</span></a><p className="mt-3 max-w-sm text-sm leading-6 text-[#89958a]">A place for the work behind the work.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3">{navItems.map(([label, href]) => <a data-testid={`link-footer-${label.toLowerCase().replaceAll(' ', '-')}`} key={label} href={href} className="text-[10px] font-bold uppercase tracking-[.13em] text-[#a6b0a4] transition-colors hover:text-[#c3e12c]">{label}</a>)}</div></div>
          <div className="flex flex-col justify-between gap-3 pt-6 font-mono-custom text-[9px] uppercase tracking-[.16em] text-[#748178] md:flex-row"><span>© 2024 Animora Studio Library</span><span>Made for the endlessly curious</span><a data-testid="link-back-to-top" href="#home" className="flex items-center gap-2 text-[#c3e12c]">Back to top <MoveUpRight size={12} /></a></div>
        </div>
      </footer>
    </main>
  );
}

export default App;