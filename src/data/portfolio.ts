import patitasImage from '../assets/images/projects/patitas.svg';
import todoImage from '../assets/images/projects/todo.png';
import movieImage from '../assets/images/projects/movie.png';

export type Project = {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  demo: string;
};

export const featuredProject: Project = {
  title: 'Patitas Unidas',
  description:
    'Plataforma solidaria para conectar rescatistas, refugios y adoptantes a través de campañas, donaciones y difusión de mascotas.',
  image: patitasImage,
  technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
  github: 'https://github.com/Josear0108/patitas-unidas',
  demo: 'https://josear0108.github.io/patitas-unidas/'
};

export const projects: Project[] = [
  {
    title: 'TodoS - Gestor de Tareas',
    description: 'Aplicación web para gestionar tareas con funcionalidades CRUD, filtrado y persistencia de datos.',
    image: todoImage,
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'LocalStorage'],
    github: 'https://github.com/ingjhonhernandezgomez/TodoS',
    demo: 'https://ingjhonhernandezgomez.github.io/TodoS/'
  },
  {
    title: 'MovieDB - Catálogo de Películas',
    description: 'Aplicación que consume la API de TMDB para mostrar películas populares, con búsqueda, filtrado y detalles.',
    image: movieImage,
    technologies: ['React', 'JavaScript', 'CSS', 'TMDB API'],
    github: 'https://github.com/ingjhonhernandezgomez/MovieDB-api_practico',
    demo: 'https://ingjhonhernandezgomez.github.io/MovieDB-api_practico/'
  }
];

export type SkillCategory = {
  title: string;
  /** Abreviatura de tres letras para la carta estilo FIFA. */
  short: string;
  skills: { name: string; level: number }[];
};

export const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend',
    short: 'FRO',
    skills: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'JavaScript', level: 90 },
      { name: 'HTML/CSS', level: 95 },
      { name: 'Tailwind CSS', level: 85 },
    ]
  },
  {
    title: 'Backend',
    short: 'BAC',
    skills: [
      { name: 'Node.js', level: 85 },
      { name: 'Express', level: 80 },
      { name: 'Python', level: 75 },
      { name: '.NET', level: 80 },
      { name: 'Java', level: 70 },
      { name: 'RESTful APIs', level: 85 },
    ]
  },
  {
    title: 'Bases de Datos',
    short: 'BDD',
    skills: [
      { name: 'MySQL', level: 85 },
      { name: 'MongoDB', level: 80 },
      { name: 'PostgreSQL', level: 75 },
      { name: 'Redis', level: 70 },
    ]
  },
  {
    title: 'DevOps & Cloud',
    short: 'DEV',
    skills: [
      { name: 'Docker', level: 80 },
      { name: 'Azure', level: 80 },
      { name: 'AWS', level: 75 },
      { name: 'CI/CD', level: 80 },
      { name: 'Git', level: 90 },
    ]
  },
  {
    title: 'Metodologías',
    short: 'MET',
    skills: [
      { name: 'Scrum', level: 85 },
      { name: 'Agile', level: 90 },
      { name: 'TDD', level: 80 },
      { name: 'Clean Code', level: 85 },
    ]
  }
];

export const contactLinks = {
  email: 'ing.jhonhernandezgomez@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jhon-gomez-139a2a1a2/',
  github: 'https://github.com/ingjhonhernandezgomez',
};
