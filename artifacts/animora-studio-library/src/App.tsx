import { type FormEvent, useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Film,
  Layers3,
  Menu,
  MoveUpRight,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { ApiError, apiFetch } from '@/lib/api';

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
  {
    id: 'tut-walk-cycle',
    title: 'Walk Cycle: Making Motion Read',
    description: 'Build a readable walk cycle by finding the contact, passing and weight-bearing poses first.',
    category: '2D',
    duration: '14 MIN',
    videoUrl: 'https://www.youtube.com/watch?v=n_11DSOBmLc',
    thumbnail: '/animora-art.jpg',
    color: 'bg-[#d7d4c8]',
  },
  {
    id: 'tut-timing-spacing',
    title: 'Timing and Spacing in Practice',
    description: 'A focused study in how spacing choices change the energy, weight and intent of a shot.',
    category: '2D',
    duration: '11 MIN',
    videoUrl: '',
    thumbnail: '/animora-hero.jpg',
    color: 'bg-[#c9d1c0]',
  },
  {
    id: 'tut-3d-modeling',
    title: '3D Modeling Tutorial',
    description: 'Start with clean forms and a simple blockout, then build a model that is ready for detail.',
    category: '3D',
    duration: '22 MIN',
    videoUrl: 'https://www.youtube.com/watch?v=1kSVb-VEhNc',
    thumbnail: '/animora-hero.jpg',
    color: 'bg-[#e2e5a9]',
  },
  {
    id: 'tut-light-texture',
    title: 'Light Before Texture',
    description: 'Use the key, fill and shadow relationship to make a scene feel intentional before adding surface detail.',
    category: '3D',
    duration: '18 MIN',
    videoUrl: '',
    thumbnail: '/animora-art.jpg',
    color: 'bg-[#c3e12c]',
  },
  {
    id: 'tut-green-screen',
    title: 'Green Screen: A Cleaner Composite',
    description: 'Key a green screen, match the light and integrate the subject into a believable plate.',
    category: 'VFX',
    duration: '16 MIN',
    videoUrl: 'https://www.youtube.com/watch?v=5mf6hP9Cnp8',
    thumbnail: '/animora-hero.jpg',
    color: 'bg-[#c3e12c]',
  },
  {
    id: 'tut-motion-tracking',
    title: 'Motion Tracking Basics',
    description: 'Track the world around a moving subject so digital elements inherit the same sense of place.',
    category: 'VFX',
    duration: '09 MIN',
    videoUrl: '',
    thumbnail: '/animora-art.jpg',
    color: 'bg-[#d7d4c8]',
  },
  {
    id: 'tut-color-grade',
    title: 'Color Grading the Final Shot',
    description: 'Bring a finished image together by shaping contrast, color relationships and the final feeling.',
    category: 'VFX',
    duration: '13 MIN',
    videoUrl: '',
    thumbnail: '/animora-hero.jpg',
    color: 'bg-[#c9d1c0]',
  },
];

type Problem = {
  id: string;
  category: '2D' | '3D' | 'VFX';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  problem: string;
  task: string;
  hint: string;
  solution: string;
  relatedCourse: string;
  relatedTutorial: string;
};

const problems: Problem[] = [
  { id: 'problem-character-movement', category: '2D', difficulty: 'Beginner', title: 'Character Movement', problem: 'Your character moves, but the action has no clear direction or weight.', task: 'Create a short movement with a readable beginning, change of direction and finish.', hint: 'Thumbnail the strongest silhouette before refining any drawing.', solution: 'Anchor the motion with a clear line of action, then use extreme and breakdown poses to keep the change visible.', relatedCourse: 'Principles of Animation', relatedTutorial: 'Timing and Spacing in Practice' },
  { id: 'problem-walk-cycle', category: '2D', difficulty: 'Beginner', title: 'Walk Cycle', problem: 'The walk feels like sliding instead of a character carrying weight through space.', task: 'Animate a looping walk with clear contact, passing and push-off poses.', hint: 'Check the feet first: the contact foot should stay planted while the body travels over it.', solution: 'Use a consistent contact distance, offset the hips and shoulders, and make the spacing widen as the body pushes into the next step.', relatedCourse: 'Character Animation', relatedTutorial: 'Walk Cycle: Making Motion Read' },
  { id: 'problem-timing-spacing', category: '2D', difficulty: 'Intermediate', title: 'Timing and Spacing', problem: 'The poses are correct, but the action still feels flat and evenly paced.', task: 'Revise a short shot so the viewer can feel acceleration, impact and settle.', hint: 'Do not add frames everywhere. Remove or cluster them to change the rhythm.', solution: 'Use wider spacing for speed, tighter spacing for held moments and a deliberate contrast at the story beat that matters most.', relatedCourse: 'Principles of Animation', relatedTutorial: 'Timing and Spacing in Practice' },
  { id: 'problem-lip-sync', category: '2D', difficulty: 'Advanced', title: 'Lip Sync', problem: 'The mouth shapes match the audio, but the dialogue does not feel connected to the character.', task: 'Animate a short line with clear phonemes and a believable performance.', hint: 'Listen for the thought behind the words, not only the individual sounds.', solution: 'Place the important vowel shapes on stressed syllables, add small anticipation and settle, and let the eyes and head support the line.', relatedCourse: 'Character Animation', relatedTutorial: 'Timing and Spacing in Practice' },
  { id: 'problem-keyframe', category: '2D', difficulty: 'Intermediate', title: 'Keyframe', problem: 'The key poses communicate the idea, but the in-between motion loses the intent.', task: 'Create a clean keyframe pass for a single expressive action.', hint: 'If the silhouette does not read in a thumbnail, more in-betweens will not fix it.', solution: 'Clarify the line of action and hierarchy in the keys first, then choose breakdowns that preserve the force of the movement.', relatedCourse: 'Fundamentals of 2D Animation', relatedTutorial: 'Timing and Spacing in Practice' },
  { id: 'problem-modeling', category: '3D', difficulty: 'Beginner', title: '3D Modeling', problem: 'The model has surface detail, but the primary forms do not feel convincing.', task: 'Block out a simple prop using clean proportions and readable planes.', hint: 'Judge the silhouette from a distance before adding bevels or texture.', solution: 'Work from large to small, keep the topology supporting the form, and check the object under a neutral light before polishing.', relatedCourse: '3D Modeling Fundamentals', relatedTutorial: '3D Modeling Tutorial' },
  { id: 'problem-rigging', category: '3D', difficulty: 'Intermediate', title: 'Rigging', problem: 'The controls technically work, but the character bends in ways that break the form.', task: 'Build a simple rig with stable deformation through one clear pose change.', hint: 'Test extreme poses early instead of waiting until the rig feels finished.', solution: 'Place joints based on the intended deformation, use clean weight ranges, and add only the controls that make the motion easier to direct.', relatedCourse: 'Character Rigging', relatedTutorial: '3D Modeling Fundamentals' },
  { id: 'problem-character-animation', category: '3D', difficulty: 'Advanced', title: 'Character Animation', problem: 'The character hits the key poses, but the performance feels mechanical.', task: 'Animate a short acting beat with a clear intention and change.', hint: 'Give the body a thought to react to before the limbs begin to move.', solution: 'Lead with the idea, offset the body parts, and use asymmetry and holds to create a performance rather than a sequence of controls.', relatedCourse: '3D Character Animation', relatedTutorial: 'Walk Cycle: Making Motion Read' },
  { id: 'problem-lighting', category: '3D', difficulty: 'Intermediate', title: 'Lighting', problem: 'The scene is technically bright, but the focal point and depth are unclear.', task: 'Light a shot with a clear subject hierarchy and readable separation.', hint: 'Start with one motivated key light before adding fill or rim light.', solution: 'Use the key to establish direction, preserve shadow shape, then add restrained fill so the eye lands where the story needs it.', relatedCourse: 'Lighting and Rendering', relatedTutorial: 'Light Before Texture' },
  { id: 'problem-rendering', category: '3D', difficulty: 'Advanced', title: 'Rendering', problem: 'The final render looks different from the viewport and loses the intended mood.', task: 'Prepare a consistent render with correct color management and a deliberate finish.', hint: 'Compare the same frame, exposure and color space before changing the lighting.', solution: 'Lock the camera and render settings, preview at a small resolution, and make one controlled change at a time so the final image stays predictable.', relatedCourse: 'Lighting and Rendering', relatedTutorial: 'Light Before Texture' },
  { id: 'problem-green-screen', category: 'VFX', difficulty: 'Beginner', title: 'Green Screen', problem: 'The key is clean around the subject, but the composite still feels pasted on.', task: 'Key a subject and place it into a new plate with believable edges and light.', hint: 'Solve spill and edge color before trying to hide the composite with a heavy grade.', solution: 'Refine the matte, despill the edges, match the direction and softness of the plate light, then add shared grain and motion blur.', relatedCourse: 'Compositing Fundamentals', relatedTutorial: 'Green Screen: A Cleaner Composite' },
  { id: 'problem-motion-tracking', category: 'VFX', difficulty: 'Intermediate', title: 'Motion Tracking', problem: 'A tracked element drifts even though the tracker says the solve is successful.', task: 'Attach a digital element to a moving plate without visible sliding.', hint: 'Track a high-contrast feature that belongs to the same plane as the element.', solution: 'Use multiple points when needed, remove bad tracks, solve the correct plane and check the composite at full speed rather than only frame by frame.', relatedCourse: 'Motion Tracking', relatedTutorial: 'Motion Tracking Basics' },
  { id: 'problem-compositing', category: 'VFX', difficulty: 'Advanced', title: 'Compositing', problem: 'The layers are aligned, but the final image lacks the small cues that make it feel photographed together.', task: 'Integrate a generated element into live-action footage with consistent depth and atmosphere.', hint: 'Match the imperfections: lens softness, grain, shadow and color response.', solution: 'Build the composite in passes, match perspective and light first, then finish with shared optical treatment so every layer belongs to the same image.', relatedCourse: 'Compositing Fundamentals', relatedTutorial: 'Green Screen: A Cleaner Composite' },
  { id: 'problem-particle-effects', category: 'VFX', difficulty: 'Intermediate', title: 'Particle Effects', problem: 'The particles add activity but do not feel connected to the scene or the force driving them.', task: 'Create a controlled particle pass that supports the action without becoming visual noise.', hint: 'Define the source, force and lifespan before choosing the look.', solution: 'Shape the emission over time, vary scale and velocity with purpose, then integrate the pass with depth, motion blur and the scene light.', relatedCourse: 'Particle Effects', relatedTutorial: 'Motion Tracking Basics' },
  { id: 'problem-color-grading', category: 'VFX', difficulty: 'Advanced', title: 'Color Grading', problem: 'The grade is dramatic, but skin, highlights and the story focus are no longer trustworthy.', task: 'Finish a shot with a controlled palette that supports mood and continuity.', hint: 'Protect the neutral references before pushing the creative look.', solution: 'Balance exposure first, isolate the focal range, then shape contrast and hue relationships while checking the shot beside its neighboring frames.', relatedCourse: 'Color Grading', relatedTutorial: 'Color Grading the Final Shot' },
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

function toYouTubeEmbedUrl(videoUrl: string) {
  if (!videoUrl) return null;
  try {
    const parsed = new URL(videoUrl);
    const host = parsed.hostname.replace(/^www\./, '');
    let videoId = '';

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoId = parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop() ?? '';
    } else if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
    }

    if (!/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  } catch {
    return null;
  }
}

function VideoModal({ tutorial, onClose }: { tutorial: typeof tutorials[number]; onClose: () => void }) {
  const embedUrl = toYouTubeEmbedUrl(tutorial.videoUrl);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0b1511]/90 p-4 backdrop-blur-sm md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-[#53665a] bg-[#172520] shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-5 border-b border-[#354a3d] px-5 py-4 text-[#eff0dc] md:px-7">
          <div className="min-w-0">
            <p className="font-mono-custom text-[9px] uppercase tracking-[.2em] text-[#c3e12c]">{tutorial.category} / TUTORIAL · {tutorial.duration}</p>
            <h2 id="tutorial-modal-title" className="mt-2 font-display text-2xl tracking-[-.05em] md:text-3xl">{tutorial.title}</h2>
          </div>
          <button data-testid="button-close-tutorial-modal" aria-label="Close tutorial video" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#53665a] text-[#c3e12c] transition-colors hover:bg-[#c3e12c] hover:text-[#172520]"><X size={16} /></button>
        </div>
        <div className="bg-[#0d1914] p-3 md:p-6">
          {embedUrl ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={tutorial.title}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-dashed border-[#53665a] bg-[#1e3028] px-6 text-center text-[#eff0dc]">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-[#c3e12c] text-[#c3e12c]"><Play size={18} /></div>
              <p className="mt-5 font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#c3e12c]">Video unavailable</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#aab5a8]">A verified video has not been configured for this tutorial yet. Check back when the lesson is published.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 border-t border-[#354a3d] px-5 py-4 text-sm leading-6 text-[#aab5a8] md:flex-row md:items-center md:justify-between md:px-7">
          <p className="max-w-xl">{tutorial.description}</p>
          {embedUrl && <span className="shrink-0 font-mono-custom text-[9px] uppercase tracking-[.16em] text-[#c3e12c]">Player controls: play / pause / fullscreen</span>}
        </div>
      </div>
    </div>
  );
}

function ProblemModal({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#0b1511]/90 p-4 backdrop-blur-sm md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-modal-title"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-[#c3e12c]/40 bg-[#ececdf] text-[#172520] shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-5 bg-[#172520] px-5 py-6 text-[#eff0dc] md:px-8 md:py-7">
          <div>
            <p className="font-mono-custom text-[9px] uppercase tracking-[.2em] text-[#c3e12c]">{problem.category} / {problem.difficulty}</p>
            <h2 id="problem-modal-title" className="mt-2 font-display text-4xl font-semibold leading-[.95] tracking-[-.07em] md:text-5xl">{problem.title}</h2>
          </div>
          <button data-testid="button-close-problem-modal" aria-label="Close problem details" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#53665a] text-[#c3e12c] transition-colors hover:bg-[#c3e12c] hover:text-[#172520]"><X size={16} /></button>
        </div>
        <div className="grid gap-7 p-5 md:grid-cols-[.8fr_1.2fr] md:p-8">
          <div>
            <p className="font-mono-custom text-[9px] uppercase tracking-[.18em] text-[#68731f]">THE PROBLEM</p>
            <p className="mt-3 text-sm leading-6 text-[#5f675f]">{problem.problem}</p>
            <p className="mt-7 font-mono-custom text-[9px] uppercase tracking-[.18em] text-[#68731f]">YOUR TASK</p>
            <p className="mt-3 text-sm leading-6 text-[#5f675f]">{problem.task}</p>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl bg-[#dedfcf] p-5">
              <p className="font-mono-custom text-[9px] uppercase tracking-[.18em] text-[#68731f]">HINT</p>
              <p className="mt-3 text-sm leading-6 text-[#5f675f]">{problem.hint}</p>
            </div>
            <div className="rounded-2xl bg-[#c3e12c] p-5">
              <p className="font-mono-custom text-[9px] uppercase tracking-[.18em] text-[#59621d]">SOLUTION</p>
              <p className="mt-3 text-sm leading-6 text-[#344116]">{problem.solution}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#c7cabc] px-5 py-5 text-[10px] font-bold uppercase tracking-[.12em] md:flex-row md:items-center md:justify-between md:px-8">
          <span className="text-[#7b8278]">Keep learning with</span>
          <div className="flex flex-wrap gap-2">
            <a href="#courses" onClick={onClose} className="rounded-full border border-[#9da497] px-3 py-2 transition-colors hover:border-[#172520]">Course: {problem.relatedCourse}</a>
            <a href="#tutorials" onClick={onClose} className="rounded-full border border-[#9da497] px-3 py-2 transition-colors hover:border-[#172520]">Tutorial: {problem.relatedTutorial}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [tutorialFilter, setTutorialFilter] = useState('ALL');
  const [problemCategoryFilter, setProblemCategoryFilter] = useState('ALL');
  const [problemDifficultyFilter, setProblemDifficultyFilter] = useState('ALL');
  const [selectedTutorial, setSelectedTutorial] = useState<typeof tutorials[number] | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [notice, setNotice] = useState('');
  const [courseItems, setCourseItems] = useState(courses);
  const [tutorialItems, setTutorialItems] = useState(tutorials);
  const [problemItems, setProblemItems] = useState(problems);
  const [sessionUser, setSessionUser] = useState<{ name: string; email: string; role: 'user' | 'admin' } | null>(null);
  const [contact, setContact] = useState({ name: '', email: '', subject: '', message: '' });
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contentError, setContentError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<{ courses: Array<{ id: number; title: string; description: string; category: '2D' | '3D' | 'VFX'; level: string; duration: string }> }>('/courses'),
      apiFetch<{ tutorials: Array<{ id: number; title: string; description: string; category: '2D' | '3D' | 'VFX'; duration: string; videoUrl: string; thumbnail: string }> }>('/tutorials'),
      apiFetch<{ problems: Problem[] }>('/problems'),
    ]).then(([courseResponse, tutorialResponse, problemResponse]) => {
      if (!active) return;
      if (courseResponse.courses.length) {
        setCourseItems(courseResponse.courses.map((course) => ({
          id: `course-${course.id}`,
          category: course.category,
          level: course.level,
          title: course.title,
          desc: course.description,
          meta: course.duration,
          visual: course.category,
        })));
      }
      if (tutorialResponse.tutorials.length) {
        setTutorialItems(tutorialResponse.tutorials.map((tutorial) => ({
          ...tutorial,
          id: `tutorial-${tutorial.id}`,
          color: tutorial.category === '3D' ? 'bg-[#e2e5a9]' : tutorial.category === 'VFX' ? 'bg-[#c3e12c]' : 'bg-[#d7d4c8]',
        })));
      }
      if (problemResponse.problems.length) setProblemItems(problemResponse.problems);
    }).catch(() => {
      if (active) setContentError('Live library content is unavailable. Showing the latest local catalog.');
    });

    apiFetch<{ user: { name: string; email: string; role: 'user' | 'admin' } }>('/auth/me')
      .then((response) => { if (active) setSessionUser(response.user); })
      .catch(() => undefined);

    return () => { active = false; };
  }, []);

  const filteredCourses = courseFilter === 'ALL' ? courseItems : courseItems.filter((course) => course.category === courseFilter);
  const filteredTutorials = tutorialFilter === 'ALL' ? tutorialItems : tutorialItems.filter((tutorial) => tutorial.category === tutorialFilter);
  const filteredProblems = problemItems.filter((problem) => (problemCategoryFilter === 'ALL' || problem.category === problemCategoryFilter) && (problemDifficultyFilter === 'ALL' || problem.difficulty === problemDifficultyFilter));
  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };
  const handleLogout = async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setSessionUser(null);
    showNotice('You have been logged out.');
  };
  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsContactSubmitting(true);
    try {
      await apiFetch('/contact-messages', { method: 'POST', body: JSON.stringify(contact) });
      setContact({ name: '', email: '', subject: '', message: '' });
      showNotice('Your message was saved. We will be in touch.');
    } catch (error) {
      showNotice(error instanceof ApiError ? error.message : 'Your message could not be saved.');
    } finally {
      setIsContactSubmitting(false);
    }
  };

  return (
    <main className="grain overflow-hidden bg-[#ececdf] text-[#172520]">
      {notice && <div data-testid="status-notice" className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[#c3e12c] px-5 py-3 text-xs font-bold shadow-xl">{notice}</div>}
      {contentError && <div className="fixed left-1/2 top-[86px] z-30 -translate-x-1/2 rounded-full border border-[#d2b06a] bg-[#fff4cf] px-4 py-2 text-[11px] font-semibold text-[#5a4c24] shadow-lg">{contentError}</div>}
      {selectedTutorial && <VideoModal tutorial={selectedTutorial} onClose={() => setSelectedTutorial(null)} />}
      {selectedProblem && <ProblemModal problem={selectedProblem} onClose={() => setSelectedProblem(null)} />}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#d0d2c3]/70 bg-[#ececdf]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1380px] items-center justify-between px-5 md:px-10">
          <a data-testid="link-brand" href="#home" className="group flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#172520] text-[#c3e12c] transition-transform group-hover:rotate-45"><span className="h-2.5 w-2.5 rounded-full border-2 border-current" /></span>
            <span className="font-display text-[13px] font-bold tracking-[.12em]">ANIMORA <span className="text-[#7c862a]">/</span> STUDIO</span>
          </a>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
            {navItems.map(([label, href]) => <a data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} key={label} href={href} className="text-[11px] font-semibold uppercase tracking-[.11em] text-[#4c554d] transition-colors hover:text-[#7a8816]">{label}</a>)}
            {sessionUser ? <><span className="max-w-[120px] truncate text-[10px] font-semibold uppercase tracking-[.08em] text-[#68731f]">{sessionUser.name}</span><button data-testid="button-logout" onClick={handleLogout} className="rounded-full border border-[#172520] px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] transition-colors hover:bg-[#172520] hover:text-[#eef0df]">Logout</button></> : <a data-testid="button-login" href="/login" className="rounded-full border border-[#172520] px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] transition-colors hover:bg-[#172520] hover:text-[#eef0df]">Login</a>}
          </nav>
          <button data-testid="button-mobile-menu" aria-label="Toggle navigation menu" onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center rounded-full border border-[#afb4a4] lg:hidden">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menuOpen && <div className="border-t border-[#d0d2c3] bg-[#ececdf] px-5 pb-5 pt-3 lg:hidden">
          {navItems.map(([label, href]) => <a data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMenuOpen(false)} key={label} href={href} className="block border-b border-[#d0d2c3] py-3 text-xs font-bold uppercase tracking-[.12em]">{label}</a>)}
          {sessionUser ? <button data-testid="button-mobile-logout" onClick={() => { setMenuOpen(false); void handleLogout(); }} className="mt-4 w-full rounded-full bg-[#172520] py-3 text-xs font-bold uppercase tracking-[.12em] text-[#eef0df]">Logout</button> : <a data-testid="button-mobile-login" href="/login" onClick={() => setMenuOpen(false)} className="mt-4 block w-full rounded-full bg-[#172520] py-3 text-center text-xs font-bold uppercase tracking-[.12em] text-[#eef0df]">Login</a>}
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
            {filteredTutorials.map((tutorial, index) => <article data-testid={`card-tutorial-${tutorial.id}`} key={tutorial.id} className="group overflow-hidden rounded-2xl border border-[#3a4c41] bg-[#1e3028] transition-colors hover:border-[#c3e12c]">
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className={`relative grid h-44 shrink-0 place-items-center overflow-hidden rounded-xl sm:h-28 sm:w-36 ${tutorial.color}`}>
                  <img src={tutorial.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-multiply transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 opacity-35 line-grid" />
                  <span className="relative grid h-10 w-10 place-items-center rounded-full border border-[#172520] text-[#172520]"><Play size={13} fill="currentColor" /></span>
                  <span className="absolute bottom-2 left-2 font-mono-custom text-[9px] font-bold text-[#172520]">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-4 font-mono-custom text-[9px] tracking-[.16em] text-[#a8b3a5]"><span>{tutorial.category} / TUTORIAL</span><span>{tutorial.duration}</span></div>
                  <h3 className="mt-3 font-display text-xl font-medium tracking-[-.04em] text-[#eff0dc]">{tutorial.title}</h3>
                  <p className="mt-2 text-sm leading-5 text-[#aab5a8]">{tutorial.description}</p>
                  <button data-testid={`button-watch-tutorial-${tutorial.id}`} onClick={() => setSelectedTutorial(tutorial)} className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#c3e12c]">Watch Tutorial <ArrowRight size={13} /></button>
                </div>
              </div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="problems" className="mx-auto max-w-[1380px] px-5 py-24 md:px-10 md:py-32">
        <SectionHeading eyebrow="04 / PROBLEM SOLVING" title="PROBLEM SOLVING" detail="Learn by solving real animation, 3D and VFX challenges." />
        <div className="mt-10 flex flex-col gap-3 border-y border-[#bfc3b3] py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {['ALL', '2D', '3D', 'VFX'].map((filter) => <button data-testid={`button-problem-category-${filter.toLowerCase()}`} key={filter} onClick={() => setProblemCategoryFilter(filter)} className={`rounded-full border px-4 py-2 font-mono-custom text-[10px] tracking-[.16em] transition-colors ${problemCategoryFilter === filter ? 'border-[#172520] bg-[#172520] text-[#eff0dc]' : 'border-[#b8bcae] text-[#697168] hover:border-[#172520]'}`}>{filter}</button>)}
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((filter) => <button data-testid={`button-problem-difficulty-${filter.toLowerCase()}`} key={filter} onClick={() => setProblemDifficultyFilter(filter)} className={`rounded-full border px-4 py-2 font-mono-custom text-[10px] tracking-[.12em] transition-colors ${problemDifficultyFilter === filter ? 'border-[#7d891b] bg-[#c3e12c] text-[#172520]' : 'border-[#b8bcae] text-[#697168] hover:border-[#172520]'}`}>{filter}</button>)}
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProblems.map((problem) => <article data-testid={`card-problem-${problem.id}`} key={problem.id} className="flex min-h-[245px] flex-col rounded-2xl border border-[#c9ccbd] bg-[#f2f2e7] p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between gap-4"><span className="font-mono-custom text-[9px] uppercase tracking-[.18em] text-[#68731f]">{problem.category} / {problem.difficulty}</span><span className="font-mono-custom text-[9px] text-[#9aa196]">CHALLENGE</span></div>
            <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-.05em]">{problem.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-5 text-[#626a62]">{problem.problem}</p>
            <button data-testid={`button-view-problem-${problem.id}`} onClick={() => setSelectedProblem(problem)} className="mt-auto inline-flex items-center gap-2 pt-6 text-left text-[10px] font-bold uppercase tracking-[.12em] text-[#172520]">View Problem <ArrowRight size={13} /></button>
          </article>)}
        </div>
        {!filteredProblems.length && <div className="mt-10 rounded-2xl border border-dashed border-[#bfc3b3] p-10 text-center text-sm text-[#606960]">No challenges match both filters. Try a different combination.</div>}
      </section>

      <section className="border-y border-[#cfd1c1] bg-[#c3e12c]">
        <div className="mx-auto grid max-w-[1380px] gap-12 px-5 py-20 md:grid-cols-[1fr_1.1fr] md:px-10 md:py-28">
          <div><p className="font-mono-custom text-[10px] uppercase tracking-[.28em] text-[#59621d]">05 / WATCH & DISCOVER</p><h2 className="font-display mt-4 max-w-lg text-5xl font-semibold leading-[.88] tracking-[-.08em] md:text-7xl">See how a thought becomes a frame.</h2><p className="mt-6 max-w-md text-sm leading-6 text-[#455117]">Three starting points for the next session, chosen across the full Animora practice.</p></div>
          <div className="grid gap-3 sm:grid-cols-3">
             {[
               ['2D Creative Demo', tutorialItems.find((tutorial) => tutorial.category === '2D')?.id],
               ['3D Visual Demo', tutorialItems.find((tutorial) => tutorial.category === '3D')?.id],
               ['VFX Cinematic Demo', tutorialItems.find((tutorial) => tutorial.category === 'VFX')?.id],
            ].map(([label, tutorialId], index) => {
               const tutorial = tutorialItems.find((item) => item.id === tutorialId);
               if (!tutorial) return null;
               return <button data-testid={`button-discover-${tutorial.category.toLowerCase()}`} key={label} onClick={() => setSelectedTutorial(tutorial)} className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-[#172520] p-5 text-left text-[#eff0dc] transition-transform hover:-translate-y-1">
                <img src={tutorial.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 opacity-30 line-grid" />
                <span className="relative flex h-full flex-col justify-between"><span className="font-mono-custom text-[9px] tracking-[.18em] text-[#c3e12c]">0{index + 1} / {tutorial.category}</span><span><span className="grid h-10 w-10 place-items-center rounded-full bg-[#c3e12c] text-[#172520]"><Play size={13} fill="currentColor" /></span><span className="mt-4 block font-display text-xl leading-none tracking-[-.05em]">{label}</span></span></span>
              </button>;
            })}
          </div>
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
           <form onSubmit={submitContact} className="rounded-3xl bg-[#172520] p-7 text-[#eff0dc] md:p-10"><p className="font-display text-2xl tracking-[-.04em]">Bring a question.</p><p className="mt-2 max-w-sm text-sm leading-6 text-[#adb6a7]">Send a note to the studio. Every message is saved to our contact inbox.</p><div className="mt-8 grid gap-5 sm:grid-cols-2"><input data-testid="input-contact-name" aria-label="Name" required value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} placeholder="Your name" className="border-b border-[#657267] bg-transparent px-0 py-3 text-sm outline-none placeholder:text-[#778479] focus:border-[#c3e12c]" /><input data-testid="input-contact-email" aria-label="Email address" required type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} placeholder="your@email.com" className="border-b border-[#657267] bg-transparent px-0 py-3 text-sm outline-none placeholder:text-[#778479] focus:border-[#c3e12c]" /><input data-testid="input-contact-subject" aria-label="Subject" required value={contact.subject} onChange={(event) => setContact({ ...contact, subject: event.target.value })} placeholder="Subject" className="border-b border-[#657267] bg-transparent px-0 py-3 text-sm outline-none placeholder:text-[#778479] focus:border-[#c3e12c] sm:col-span-2" /><textarea data-testid="input-contact-message" aria-label="Message" required value={contact.message} onChange={(event) => setContact({ ...contact, message: event.target.value })} placeholder="Your message" rows={4} className="resize-none border-b border-[#657267] bg-transparent px-0 py-3 text-sm outline-none placeholder:text-[#778479] focus:border-[#c3e12c] sm:col-span-2" /></div><button data-testid="button-contact-submit" disabled={isContactSubmitting} type="submit" className="mt-7 flex items-center gap-3 rounded-full bg-[#c3e12c] px-5 py-3 text-xs font-bold uppercase tracking-[.11em] text-[#172520] disabled:opacity-60">{isContactSubmitting ? 'Saving...' : 'Send message'} <ArrowRight size={16} /></button><p className="mt-5 flex items-center gap-2 font-mono-custom text-[9px] uppercase tracking-[.16em] text-[#829084]"><Check size={13} className="text-[#c3e12c]" /> No fake success. Only confirmed saves.</p></form>
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