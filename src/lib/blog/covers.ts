/**
 * Cover images a post can use. These are the photos already on the site (public/images);
 * uploads from the admin panel replace this list in a later phase.
 */
export const BLOG_COVERS = [
  { src: '/images/showcase/1.jpg', label: 'Showcase 1' },
  { src: '/images/showcase/2.jpg', label: 'Showcase 2' },
  { src: '/images/showcase/3.jpg', label: 'Showcase 3' },
  { src: '/images/showcase/4.jpg', label: 'Showcase 4' },
  { src: '/images/facility/1.jpg', label: 'Workshop 1' },
  { src: '/images/facility/2.jpg', label: 'Workshop 2' },
  { src: '/images/facility/3.jpg', label: 'Workshop 3' },
  { src: '/images/services/apex.jpg', label: 'Apex film' },
  { src: '/images/services/sapphire.jpg', label: 'Sapphire film' },
  { src: '/images/services/opal.jpg', label: 'Opal film' },
  { src: '/images/services/stealth.jpg', label: 'Stealth film' },
  { src: '/images/services/frozen.jpg', label: 'Frozen film' },
  { src: '/images/services/solaris.jpg', label: 'Solaris window film' },
  { src: '/images/services/luminox.jpg', label: 'Luminox window film' },
] as const;

export const BLOG_COVER_PATHS: readonly string[] = BLOG_COVERS.map((cover) => cover.src);
