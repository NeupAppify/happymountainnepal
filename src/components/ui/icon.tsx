'use client';

import * as React from 'react';

import Bell from '@neup/components/animation/Bell';
import CloudSync from '@neup/components/animation/CloudSync';
import CodeRevolve from '@neup/components/animation/CodeRevolve';
import Connecting from '@neup/components/animation/Connecting';
import Copy from '@neup/components/animation/Copy';
import CrossMark from '@neup/components/animation/CrossMark';
import CreateFile from '@neup/components/animation/CreateFile';
import Deploy from '@neup/components/animation/Deploy';
import Deleted from '@neup/components/animation/Deleted';
import Disconnected from '@neup/components/animation/Disconnected';
import Download from '@neup/components/animation/Download';
import DownloadWhite from '@neup/components/animation/DownloadWhite';
import Hide from '@neup/components/animation/Hide';
import Info from '@neup/components/animation/Info';
import Loading from '@neup/components/animation/Loading';
import Lock from '@neup/components/animation/Lock';
import Pending from '@neup/components/animation/Pending';
import Play from '@neup/components/animation/Play';
import Save from '@neup/components/animation/Save';
import Send from '@neup/components/animation/Send';
import Search from '@neup/components/animation/Search';
import Searched from '@neup/components/animation/Searched';
import Show from '@neup/components/animation/Show';
import Stop from '@neup/components/animation/Stop';
import TickMark from '@neup/components/animation/TickMark';
import TickMarkWhite from '@neup/components/animation/TickMarkWhite';
import Trash from '@neup/components/animation/Trash';
import Unlock from '@neup/components/animation/Unlock';
import Upload from '@neup/components/animation/Upload';
import Warning from '@neup/components/animation/Warning';

type AnimationComponent = React.ComponentType<{
  size?: number;
  duration?: number;
  label?: string | null;

  /**
   * 0 = play animation, 1 = play the target animation, 2 = hold its 100% state
   */
  position?: number;
}>;

type IconBaseProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children' | 'color'
> & {
  size?: number;

  /**
   * Duration of the icon animation.
   */
  duration?: number;

  /**
   * Animation position.
   *
   * 0 = start / play `from`
   * 1 = start / play `to`
   * 2 = render the 100% end state
   *
   * Defaults to 0.
   */
  position?: number;

  /**
   * Called after a `from -> to` animation completes.
   *
   * Normally the parent should then update:
   *
   * position={2}
   */
  onComplete?: () => void;
};

export type AnimatedIconProps = IconBaseProps & {
  type: 'animated';
  from: string;
  to?: string;
};

export type GifIconProps = IconBaseProps & {
  type: 'gif';
  source: string;
  repeats?: boolean;
};

export type StaticIconProps = IconBaseProps & {
  type: 'static';
  source: string;
};

export type IconProps =
  | AnimatedIconProps
  | GifIconProps
  | StaticIconProps;

const animations: Record<string, AnimationComponent> = {
  bell: Bell,
  cloudsync: CloudSync,
  coderevolve: CodeRevolve,
  connecting: Connecting,
  copy: Copy,
  crossmark: CrossMark,
  createfile: CreateFile,
  delete: Trash,
  deploy: Deploy,
  deleted: Deleted,
  disconnected: Disconnected,
  download: Download,
  download_white: DownloadWhite,
  hide: Hide,
  info: Info,
  loading: Loading,
  lock: Lock,
  pending: Pending,
  play: Play,
  save: Save,
  send: Send,
  search: Search,
  searched: Searched,
  show: Show,
  stop: Stop,
  tickmark: TickMark,
  tickmark_white: TickMarkWhite,
  trash: Trash,
  unlock: Unlock,
  upload: Upload,
  warning: Warning,
};

function normalizeAnimationName(name: string) {
  return (
    name
      .trim()
      .replace(/\.(?:tsx?|jsx?)$/, '')
      .split('/')
      .pop()
      ?.toLowerCase() ?? ''
  );
}

function getAnimation(name: string) {
  return animations[normalizeAnimationName(name)];
}

function normalizePosition(position: number | undefined) {
  if (!Number.isFinite(position)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(position ?? 0), 0), 2);
}

function UnknownAnimation({
  name,
}: {
  name: string;
}) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Icon: animation "${name}" is not registered.`,
    );
  }

  return null;
}

type AnimatedIconInternalProps = Pick<
  AnimatedIconProps,
  | 'from'
  | 'to'
  | 'size'
  | 'duration'
  | 'position'
  | 'onComplete'
>;

function AnimatedIcon({
  from,
  to,
  size,
  duration = 1200,
  position = 0,
  onComplete,
}: AnimatedIconInternalProps) {
  const FromAnimation = getAnimation(from);
  const ToAnimation = to
    ? getAnimation(to)
    : undefined;

  const currentPosition =
    normalizePosition(position);

  React.useEffect(() => {
    if (!to || currentPosition !== 1 || !onComplete) {
      return;
    }

    const timeout = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timeout);
  }, [currentPosition, duration, onComplete, to]);

  const renderEndState = (
    Animation: AnimationComponent,
  ) => (
    <>
      <span data-neup-icon-final-state>
        <Animation
          size={size}
          duration={duration}
          label="Animated icon"
        />
      </span>
      <style>{`
        [data-neup-icon-final-state],
        [data-neup-icon-final-state] * {
          animation-delay: 0ms !important;
          animation-direction: reverse !important;
          animation-fill-mode: both !important;
          animation-iteration-count: 1 !important;
          animation-play-state: paused !important;
        }
      `}</style>
    </>
  );

  if (!FromAnimation) {
    return <UnknownAnimation name={from} />;
  }

  /**
   * --------------------------------------------------
   * NO "to"
   * --------------------------------------------------
   *
   * position has no effect.
   *
   * The animation behaves normally and can loop
   * infinitely if the animation component itself loops.
   *
   * position={0}
   * position={1}
   * position={2}
   *
   * both behave identically here.
   */
  if (!to) {
    if (currentPosition >= 2) {
      return renderEndState(FromAnimation);
    }

    return (
      <FromAnimation
        size={size}
        duration={duration}
        label="Animated icon"
      />
    );
  }

  if (!ToAnimation) {
    return <UnknownAnimation name={to} />;
  }

  /**
   * --------------------------------------------------
   * position = 2
   * --------------------------------------------------
   *
   * The transition is finished.
   *
   * Only render the final "to" animation/frame.
   *
   * position={2} tells the icon
   * to hold its final frame.
   */
  if (currentPosition >= 2) {
    return renderEndState(ToAnimation);
  }

  if (currentPosition === 1) {
    return (
      <ToAnimation
        size={size}
        duration={duration}
        label="Animated icon"
      />
    );
  }

  /**
   * --------------------------------------------------
   * position = 0 -> < 1
   * --------------------------------------------------
   *
   * Play from -> to.
   */
  const transitionDuration = 360;

  const transitionDelay =
    currentPosition > 0
      ? `-${currentPosition * transitionDuration}ms`
      : '0ms';

  const handleTransitionComplete = (
    event: React.AnimationEvent<HTMLSpanElement>,
  ) => {
    /**
     * Ignore animation events bubbling from the
     * animation component itself.
     */
    if (event.target !== event.currentTarget) {
      return;
    }

    /**
     * Only source disappearance controls completion.
     */
    if (
      event.animationName !==
      'neup-icon-source-disappear'
    ) {
      return;
    }

    onComplete?.();
  };

  return (
    <span
      aria-label="Animated icon transition"
      style={{
        display: 'inline-grid',
        width: size,
        height: size,
        placeItems: 'center',
        position: 'relative',
      }}
    >
      {/* FROM */}
      <span
        onAnimationEnd={
          handleTransitionComplete
        }
        style={{
          gridArea: '1 / 1',
          animation: `
            neup-icon-source-disappear
            ${transitionDuration}ms
            ease-in
            ${transitionDelay}
            forwards
          `,
        }}
      >
        <FromAnimation
          size={size}
          duration={duration}
          label={null}
        />
      </span>

      {/* TO */}
      <span
        style={{
          gridArea: '1 / 1',
          opacity: 0,
          animation: `
            neup-icon-target-appear
            ${transitionDuration}ms
            cubic-bezier(.34, 1.56, .64, 1)
            ${transitionDelay}
            forwards
          `,
        }}
      >
        <ToAnimation
          size={size}
          duration={transitionDuration}
          label={null}
        />
      </span>

      <style>{`
        @keyframes neup-icon-source-disappear {
          0% {
            opacity: 1;
            transform: scale(1);
          }

          100% {
            opacity: 0;
            transform: scale(.72);
          }
        }

        @keyframes neup-icon-target-appear {
          0% {
            opacity: 0;
            transform: scale(.72);
          }

          55% {
            opacity: 1;
            transform: scale(1.08);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </span>
  );
}

export function Icon(props: IconProps) {
  const {
    type,
    size = 32,
    duration = 1200,
    position = 0,
    className,
    style,
    onComplete,
    ...rest
  } = props;

  const {
    from: _from,
    to: _to,
    source: _source,
    repeats: _repeats,
    position: _position,
    onComplete: _onComplete,
    ...htmlProps
  } = rest as React.HTMLAttributes<HTMLDivElement> & {
    from?: string;
    to?: string;
    source?: string;
    repeats?: boolean;
    position?: number;
    onComplete?: () => void;
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      {...htmlProps}
    >
      {type === 'animated' ? (
        <AnimatedIcon
          from={props.from}
          to={props.to}
          size={size}
          duration={duration}
          position={position}
          onComplete={onComplete}
        />
      ) : (
        <img
          src={props.source}
          alt=""
          width={size}
          height={size}
          data-icon-type={type}
          data-icon-repeats={
            type === 'gif'
              ? String(props.repeats ?? true)
              : undefined
          }
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  );
}

export default Icon;
