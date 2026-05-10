// ASCEND — Content type definitions
// Source of truth for all JSON data loaded at runtime.
// These mirror the JSON schema files in data/*.schema.json.

import type { StatKey } from '../core/constants';

// ─────────────────────────────────────────────
// QUESTION
// ─────────────────────────────────────────────

export interface StatDelta {
  stat:  StatKey;
  delta: number;
}

export interface NpcDelta {
  npcId: string;
  delta: number;
}

export interface QuestionOption {
  id:               string;
  label:            string;
  text:             string;
  statDeltas:       StatDelta[];
  npcDeltas:        NpcDelta[];
  consequenceTags:  string[];
  innerMonologue:   string;
  lockCondition?:   string;   // optional: consequence tag that locks this option
}

export interface Question {
  id:               string;
  year:             number;
  questionNumber:   number;
  title:            string;
  category:         string;
  setup:            string;
  anchoredNPCs:     string[];
  arcBeatAnchors:   string[];
  options:          QuestionOption[];
}

// ─────────────────────────────────────────────
// NPC
// ─────────────────────────────────────────────

export interface NpcVoicePattern {
  description:    string;
  tell:           string;
  examplePhrases: string[];
}

export interface NpcArcBeat {
  id:                  string;
  year:                number;
  questionAnchor:      string;
  description:         string;
  requiresRelationship: number | null;
  statefulTrigger:     string | null;
}

export interface NpcThresholdUnlock {
  band:        string;
  unlocks:     string;
  description: string;
}

export interface NpcDefinition {
  id:                       string;
  name:                     string;
  archetype:                string;
  ladderLevel:              number;
  ladderTitle:              string;
  yearsAtAurel:             number;
  mvpTier:                  number;
  startingRelationshipBase: number;
  publicRole:               string;
  privateGoal:              string;
  contradiction:            string;
  voicePattern:             NpcVoicePattern;
  arcBeats:                 NpcArcBeat[];
  thresholdUnlocks?:        NpcThresholdUnlock[];
}

// ─────────────────────────────────────────────
// BACKGROUNDS
// ─────────────────────────────────────────────

export interface StatBonus {
  stat:   StatKey;
  delta:  number;
  reason: string;
}

export interface WorkStyleFragments {
  opening: string;
  middle:  string;
  closing: string;
}

export interface Background {
  id:                   string;
  name:                 string;
  tagline:              string;
  narrativeDescription: string;
  startingRole:         string;
  primaryBonuses:       StatBonus[];
  secondaryBonuses:     StatBonus[];
  dialogueFlavorTags:   string[];
  workStyleFragments:   WorkStyleFragments;
  firstDayLetterVariant: string;
}

export interface BackgroundsFile {
  version:     string;
  backgrounds: Background[];
}

// ─────────────────────────────────────────────
// TRAITS
// ─────────────────────────────────────────────

export interface CognitiveAxisDeltas {
  socialEnergy?:     number;
  signalReading?:    number;
  decisionLens?:     number;
  operatingStyle?:   number;
}

export interface Trait {
  id:                  string;
  displayText:         string;
  selectionContext:    string;
  cognitiveAxisDeltas: CognitiveAxisDeltas;
  workStyleFragment:   string;
  dialogueUnlocks:     string[];
  synergiesWith:       string[];
  tensionWith:         string[];
}

export interface TraitsFile {
  version:        string;
  selectionRules: { count: number; from: number };
  traits:         Trait[];
}

// ─────────────────────────────────────────────
// REVIEW RULES
// ─────────────────────────────────────────────

export interface AttributeAggregateWeights {
  executionDiscipline:  number;
  strategicInfluence:   number;
  reputation:           number;
  remainingSevenAverage: number;
}

export interface ReviewFormula {
  attributeAggregate: {
    weight:           number;
    internalWeights:  AttributeAggregateWeights;
    remainingStats:   string[];
  };
  performanceScore: {
    weight:      number;
    tagWeights:  Record<string, number | string>;
  };
  sponsorStrength: { weight: number };
  politicalCapital: { weight: number };
}

export interface ScorecardBand {
  band:       string;
  label:      string;
  range:      [number, number];
}

export interface ReviewRules {
  version:        string;
  formula:        ReviewFormula;
  scorecardBands: Record<string, ScorecardBand[]>;
  promotionRules: {
    promoted:           { condition: string };
    holdStretch:        { condition: string };
    holdStandard:       { condition: string };
    belowLine:          { condition: string };
  };
}
