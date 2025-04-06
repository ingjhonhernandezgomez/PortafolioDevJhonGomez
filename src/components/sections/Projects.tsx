import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';

// Usar rutas absolutas desde el directorio src
import todoImage from '../../assets/images/projects/todo.png';
import movieImage from '../../assets/images/projects/movie.png';
import catImage from '../../assets/images/projects/cat.png';
import landingImage from '../../assets/images/projects/landing.png';

const Projects = () => {
  const projects = [
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
    },
    {
      title: 'Gatitos API',
      description: 'Aplicación que consume la API de The Cat API para mostrar imágenes aleatorias de gatos con funcionalidad de favoritos.',
      image: catImage,
      technologies: ['JavaScript', 'HTML', 'CSS', 'The Cat API'],
      github: 'https://github.com/ingjhonhernandezgomez/apis-gatitos_basic',
      demo: 'https://ingjhonhernandezgomez.github.io/apis-gatitos_basic/'
    },
    {
      title: 'Asyn Landing',
      description: 'Landing page personal para mostrar futuros videos y contenido multimedia.',
      image: landingImage,
      technologies: ['HTML', 'CSS', 'JavaScript'],
      github: 'https://github.com/ingjhonhernandezgomez/asyn-landing',
      demo: 'https://ingjhonhernandezgomez.github.io/asyn-landing/'
    }
  ];

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
            Mis Proyectos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Algunos de los proyectos que he desarrollado para mejorar mis habilidades y aprender nuevas tecnologías
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    <FiGithub className="mr-2" />
                    Código
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    <FiExternalLink className="mr-2" />
                    Demo
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects; 