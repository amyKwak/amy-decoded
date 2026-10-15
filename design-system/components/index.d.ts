// The Lucky Goose components. Global: window.LuckyGoose. Docs only.
export type HeroClass = 'knight' | 'thief' | 'wizard' | 'jester';
export type Stat = 'STR' | 'DEX' | 'INT' | 'CHA';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = candle gold, one per screen. secondary = oak. danger = red wax. ghost = text link. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** lg = 64px tall, for the screen's main action. */
  size?: 'md' | 'lg';
  /** Full width of the column. */
  block?: boolean;
  children: React.ReactNode;
}
export interface ClassBadgeProps { heroClass: HeroClass; }
export interface ClassPickerProps {
  value?: HeroClass;
  onChange?: (heroClass: HeroClass) => void;
  /** Show the one-line class description under each tile. */
  showBlurb?: boolean;
  label?: string;
}
export interface HeroSlotProps {
  /** Leave name and heroClass empty for the "+ Add a hero" slot. */
  name?: string;
  heroClass?: HeroClass;
  onRemove?: () => void;
  onAdd?: () => void;
  addLabel?: string;
}
export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  hint?: string;
  multiline?: boolean;
  maxLength?: number;
  id?: string;
}
export interface QuestCardProps { title: string; hint?: string; selected?: boolean; onClick?: () => void; }
export interface StoryLineProps {
  /** current = being read aloud now; earlier = shown above; read = old, shrunk. */
  state?: 'current' | 'earlier' | 'read';
  /** Who reads this line aloud. */
  reader?: { name: string; heroClass: HeroClass };
  /** Show the blinking caret while the line streams in. */
  streaming?: boolean;
  children: React.ReactNode;
}
export interface PartyHero { name: string; heroClass: HeroClass; hp: number; maxHp?: number; active?: boolean; }
export interface PartyBarProps { heroes: PartyHero[]; }
export interface ChoiceCardProps {
  stat: Stat;
  dc: number;
  /** The hero choosing. When the stat matches their class, the tag turns their colour and shows the +3. */
  heroClass?: HeroClass;
  onClick?: () => void;
  children: React.ReactNode;
}
export interface DiceRollProps {
  /** The natural d20 result, 1 to 20. */
  value?: number;
  /** Class bonus, usually 3 or 0. */
  modifier?: number;
  dc?: number;
  rolling?: boolean;
  rollingText?: string;
  nat20Text?: string;
  nat1Text?: string;
}
export interface EndScreenProps {
  outcome: 'victory' | 'defeat';
  title?: string;
  subtitle?: string;
  /** The recap, set on parchment. */
  children?: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onNewQuest?: () => void;
  onNewParty?: () => void;
}
