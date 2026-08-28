import type { SVGProps } from "react";
import {
  subjectIdentityForSlug,
  type SubjectIdentity,
} from "./subject-identity";

export type SubjectVisualSize = "sm" | "md" | "lg";

const VISUAL_SIZES: Record<SubjectVisualSize, number> = {
  sm: 96,
  md: 144,
  lg: 208,
};

function GroundShadow() {
  return <ellipse cx={32} cy={52} rx={16} ry={3.5} fill="var(--nomi-ink)" opacity={0.07} />;
}

function Backdrop({ identity }: { identity: SubjectIdentity }) {
  return <circle cx={32} cy={30} r={21} fill={identity.soft} opacity={0.9} />;
}

function MathematicsVisual({ identity }: { identity: SubjectIdentity }) {
  return (
    <g>
      <Backdrop identity={identity} />
      <GroundShadow />
      <g fill="none" stroke={identity.color} strokeWidth={1.2} opacity={0.45} strokeDasharray="3 3">
        <path d="M12 50 h20" />
        <path d="M12 50 v-20" />
      </g>
      <g>
        <polygon points="40,20 50,25 40,30 30,25" fill={identity.soft} stroke={identity.color} strokeOpacity={0.35} strokeWidth={1} />
        <polygon points="50,25 40,30 40,44 50,39" fill={identity.color} opacity={0.55} />
        <polygon points="30,25 40,30 40,44 30,39" fill={identity.color} opacity={0.95} />
        <path d="M35,22.5 L45,27.5" stroke={identity.color} strokeOpacity={0.5} strokeWidth={1} fill="none" />
        <path d="M45,22.5 L35,27.5" stroke={identity.color} strokeOpacity={0.5} strokeWidth={1} fill="none" />
      </g>
      <g transform="translate(-4 -4)">
        <polygon points="20,14 27,17.5 20,21 13,17.5" fill={identity.soft} stroke={identity.color} strokeOpacity={0.3} strokeWidth={0.8} />
        <polygon points="20,21 13,17.5 13,28 20,31.5" fill={identity.color} opacity={0.7} />
        <polygon points="20,21 27,17.5 27,28 20,31.5" fill={identity.color} opacity={0.4} />
      </g>
    </g>
  );
}

function PhysicsVisual({ identity }: { identity: SubjectIdentity }) {
  return (
    <g>
      <Backdrop identity={identity} />
      <GroundShadow />
      <ellipse
        cx={39}
        cy={29}
        rx={17}
        ry={7}
        transform="rotate(-15 39 29)"
        fill="none"
        stroke={identity.color}
        strokeWidth={1.5}
        opacity={0.9}
      />
      <circle cx={39} cy={29} r={2.6} fill={identity.color} opacity={0.6} />
      <circle cx={51} cy={24} r={4} fill={identity.color} />
      <circle cx={51} cy={24} r={6} fill="none" stroke={identity.color} strokeOpacity={0.35} strokeWidth={1} />
      <line x1={15} y1={15} x2={25} y2={39} stroke={identity.color} strokeWidth={1.5} opacity={0.9} />
      <circle cx={15} cy={14} r={2.6} fill={identity.color} opacity={0.7} />
      <circle cx={25} cy={39} r={6} fill={identity.color} />
      <circle cx={25} cy={39} r={2.4} fill={identity.soft} opacity={0.9} />
      <path
        d="M38 46 q 14 -2 18 8"
        fill="none"
        stroke={identity.color}
        strokeWidth={1.1}
        strokeDasharray="2 3"
        opacity={0.6}
      />
    </g>
  );
}

function ChemistryVisual({ identity }: { identity: SubjectIdentity }) {
  return (
    <g>
      <Backdrop identity={identity} />
      <GroundShadow />
      <line x1={15} y1={17} x2={27} y2={21} stroke={identity.color} strokeWidth={1.4} opacity={0.7} />
      <line x1={33} y1={23} x2={42} y2={17} stroke={identity.color} strokeWidth={1.4} opacity={0.7} />
      <circle cx={15} cy={16} r={5} fill={identity.color} opacity={0.75} />
      <circle cx={27} cy={21} r={7} fill={identity.color} />
      <circle cx={27} cy={21} r={2.8} fill={identity.soft} opacity={0.9} />
      <circle cx={43} cy={16} r={4.5} fill={identity.color} opacity={0.85} />
      <g>
        <rect x={40} y={27} width={5} height={9} rx={1.6} fill={identity.color} opacity={0.8} />
        <circle cx={44} cy={40} r={9.5} fill="none" stroke={identity.color} strokeWidth={1.4} />
        <path d="M35.5 45 a8.5 8.5 0 0 0 17 0 a8.5 8.5 0 0 1 -17 0 z" fill={identity.color} opacity={0.85} />
        <circle cx={42} cy={44} r={1.5} fill={identity.soft} opacity={0.85} />
        <circle cx={48} cy={46} r={1.1} fill={identity.soft} opacity={0.7} />
      </g>
    </g>
  );
}

function BiologyVisual({ identity }: { identity: SubjectIdentity }) {
  return (
    <g>
      <Backdrop identity={identity} />
      <GroundShadow />
      <g>
        <line x1={10} y1={12} x2={10} y2={25} stroke={identity.color} strokeWidth={1.3} opacity={0.8} />
        <line x1={14} y1={14} x2={14} y2={27} stroke={identity.color} strokeWidth={1.3} opacity={0.8} />
        <line x1={10} y1={15} x2={12} y2={17} stroke={identity.color} strokeWidth={1} opacity={0.8} />
        <line x1={12} y1={19} x2={14} y2={19} stroke={identity.color} strokeWidth={1} opacity={0.8} />
        <line x1={10} y1={23} x2={12} y2={21} stroke={identity.color} strokeWidth={1} opacity={0.8} />
      </g>
      <path
        d="M20 44 C 14 34, 16 21, 35 18 C 32 29, 27 39, 20 44 Z"
        fill={identity.color}
        opacity={0.92}
      />
      <path d="M21 43 C 28 35, 31 27, 33 20" fill="none" stroke={identity.soft} strokeWidth={1.2} opacity={0.85} />
      <g>
        <circle cx={50} cy={29} r={9} fill={identity.soft} stroke={identity.color} strokeOpacity={0.5} strokeWidth={1.1} />
        <circle cx={50} cy={30} r={3.4} fill={identity.color} />
        <circle cx={50} cy={30} r={1.4} fill={identity.soft} opacity={0.9} />
      </g>
    </g>
  );
}

export function SubjectVisual({
  subject,
  size = "md",
  className,
  ...props
}: {
  subject: string | null | undefined;
  size?: SubjectVisualSize;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "subject" | "size" | "className">) {
  const identity = subjectIdentityForSlug(subject);
  const pixelSize = VISUAL_SIZES[size];

  return (
    <svg
      aria-hidden="true"
      className={className}
      height={pixelSize}
      viewBox="0 0 64 64"
      width={pixelSize}
      {...props}
    >
      {identity.key === "mathematics" ? <MathematicsVisual identity={identity} /> : null}
      {identity.key === "physics" ? <PhysicsVisual identity={identity} /> : null}
      {identity.key === "chemistry" ? <ChemistryVisual identity={identity} /> : null}
      {identity.key === "biology" ? <BiologyVisual identity={identity} /> : null}
    </svg>
  );
}