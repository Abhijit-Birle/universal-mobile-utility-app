/**
 * Contextual Zen Engine
 * - Calculates a "stress score" from the user's local data
 * - Maps stress context to the best exercise recommendation
 * - Provides pre-written, TTS-optimized meditation scripts
 */

// ─── Stress Score Engine ───────────────────────────────────────────────────────
export function calculateStressScore(todos = [], transactions = []) {
  let score = 0;
  const today = new Date().toISOString().split('T')[0];
  const reasons = [];

  const overdue = todos.filter(t => {
    if (t.done) return false;
    if (!t.due) return false;
    return t.due < today;
  });
  if (overdue.length >= 1) { score += overdue.length * 2; reasons.push(`${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`); }

  const urgentTasks = todos.filter(t => !t.done && t.priority === 1);
  if (urgentTasks.length >= 2) { score += urgentTasks.length * 3; reasons.push(`${urgentTasks.length} urgent P1 tasks`); }

  const todayExpenses = transactions.filter(t =>
    t.type === 'expense' && (t.date === today || t.date === 'Today')
  );
  const todaySpend = todayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  if (todaySpend > 5000) { score += 4; reasons.push('high spend today'); }

  const totalPending = todos.filter(t => !t.done).length;
  if (totalPending > 10) { score += 3; reasons.push(`${totalPending} open tasks`); }

  return { score, reasons, isHigh: score >= 6 };
}

// ─── Context → Recommendation Mapping ─────────────────────────────────────────
export function getZenRecommendation(stressResult) {
  const { score, reasons } = stressResult;

  if (score >= 12) {
    return {
      technique: 'box',
      title: 'You need Box Breathing',
      subtitle: 'High stress detected. 4×4 rhythm will reset your nervous system.',
      emoji: '🔲',
      color: '#85B7EB',
    };
  }
  if (score >= 8) {
    return {
      technique: '4-7-8',
      title: 'Take a deep breath',
      subtitle: `${reasons[0] || 'A lot on your mind'}. 4-7-8 breathing brings calm fast.`,
      emoji: '🌬️',
      color: '#D85A30',
    };
  }
  if (score >= 5) {
    return {
      technique: 'guided',
      title: 'A mindful pause',
      subtitle: 'Your plate is full. A 3-minute guided reset will help you think clearly.',
      emoji: '🧘',
      color: '#5DCAA5',
    };
  }
  return {
    technique: 'bodyscan',
    title: 'Check in with yourself',
    subtitle: 'A quick body scan to stay grounded and present.',
    emoji: '✨',
    color: '#FAC775',
  };
}

// ─── Pre-written Meditation Scripts (TTS-Optimized) ──────────────────────────
// These are written with natural pauses (marked with ...) for speechSynthesis
export const MEDITATION_SCRIPTS = {
  task_overwhelm: {
    title: 'Letting Go of the List',
    duration: '3 min',
    context: 'high task load',
    script: `Close your eyes... and take a slow, deep breath in. ...
Hold it gently... and let it go.

Right now, your to-do list does not define you. Every task on that list is just a thought. And thoughts, like clouds... can drift past.

Breathe in for four counts. One... two... three... four.
Hold... two... three... four.
Breathe out... two... three... four... five... six... seven... eight.

Feel your shoulders drop. Feel the tension in your jaw... release.

You are not behind. You are exactly where you need to be, right now, in this breath.

The tasks will be there. But this moment of calm... this is what gives you the clarity to handle them with ease.

Take one more deep breath in... and slowly release.

When you open your eyes, you will feel lighter. Carry that lightness with you.`,
  },

  financial_stress: {
    title: 'Peace with Money',
    duration: '3 min',
    context: 'financial stress',
    script: `Begin by breathing slowly... in through your nose... and out through your mouth.

Money is energy... and energy flows. What has left, will return. What feels scarce, has space to grow.

Breathe in... two... three... four.
And out... two... three... four... five... six.

Notice any tightness in your chest... and breathe into it. Not to fix it... but to acknowledge it.

You are safe right now. In this moment, you have everything you need.

Financial anxiety often comes from fear of the future. But the future is not here yet. Only this breath is here.

Breathe in... a feeling of abundance. Breathe out... the worry.

You are resourceful. You are capable. And you have handled hard days before... and you will again.

One final breath... deep... and release.`,
  },

  morning_focus: {
    title: 'Morning Clarity',
    duration: '2 min',
    context: 'start of day',
    script: `Good morning. Before the day begins... let's set an intention.

Breathe in slowly... feeling the freshness of a new start.
And breathe out... any residue from yesterday.

Today is a clean slate. Whatever happened before does not follow you here.

Take a moment to think of just one thing... one thing that would make today feel successful. Not a whole list... just one thing.

Hold it in your mind.

Now breathe in... as if you are breathing energy into that one thing.
And breathe out... confidence.

You are ready. The day is yours.

Open your eyes slowly... and begin.`,
  },

  evening_unwind: {
    title: 'Evening Release',
    duration: '3 min',
    context: 'end of day',
    script: `The day is done. Whatever happened... let it be done too.

Close your eyes and take a slow breath in... counting to five.
One... two... three... four... five.
And slowly breathe out... for seven counts.
One... two... three... four... five... six... seven.

Think of one moment from today that you are proud of. Even something small. A kind word. A task completed. A moment of patience.

Let that feeling sit with you... and breathe into it.

Now gently, let go of everything else. The unfinished tasks will wait. The worries will still be there if you need them tomorrow.

But right now... you have permission to rest.

Breathe in peace... breathe out the day.

You did enough. You are enough. Rest well.`,
  },

  pre_focus: {
    title: 'Before Deep Work',
    duration: '2 min',
    context: 'pre-task focus',
    script: `You are about to do something that matters. Let's clear the mental fog.

Breathe in deeply... and as you breathe out, release any distractions.

Your phone notifications... don't matter right now.
Other people's opinions... not right now.
The past... not right now.
The future... not right now.

Only this. Only the work in front of you.

Take two more powerful breaths.
In... and out.
In... and out.

Your mind is sharp. Your focus is deep. And everything you need to do excellent work... is already inside you.

Begin.`,
  },
};

// ─── Get best script for current context ──────────────────────────────────────
export function getScriptForContext(stressResult, hour = new Date().getHours()) {
  const { score } = stressResult;
  if (hour < 10) return MEDITATION_SCRIPTS.morning_focus;
  if (hour >= 20) return MEDITATION_SCRIPTS.evening_unwind;
  if (score >= 8) return MEDITATION_SCRIPTS.task_overwhelm;
  if (score >= 5) return MEDITATION_SCRIPTS.pre_focus;
  return MEDITATION_SCRIPTS.morning_focus;
}
