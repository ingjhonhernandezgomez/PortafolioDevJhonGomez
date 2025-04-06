import { motion } from 'framer-motion';
import { 
  FiCode, 
  FiDatabase, 
  FiServer, 
  FiCloud, 
  FiGitBranch,
  FiLayers,
  FiCpu,
  FiMonitor
} from 'react-icons/fi';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Frontend',
      icon: <FiMonitor className="w-6 h-6" />,
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
      icon: <FiServer className="w-6 h-6" />,
      skills: [
        { name: 'Node.js', level: 85 },
        { name: 'Express', level: 80 },
        { name: 'Python', level: 75 },
        { name: 'Java', level: 70 },
        { name: 'RESTful APIs', level: 85 },
      ]
    },
    {
      title: 'Bases de Datos',
      icon: <FiDatabase className="w-6 h-6" />,
      skills: [
        { name: 'MySQL', level: 85 },
        { name: 'MongoDB', level: 80 },
        { name: 'PostgreSQL', level: 75 },
        { name: 'Redis', level: 70 },
      ]
    },
    {
      title: 'DevOps & Cloud',
      icon: <FiCloud className="w-6 h-6" />,
      skills: [
        { name: 'Docker', level: 80 },
        { name: 'AWS', level: 75 },
        { name: 'CI/CD', level: 80 },
        { name: 'Git', level: 90 },
      ]
    },
    {
      title: 'Metodologías',
      icon: <FiLayers className="w-6 h-6" />,
      skills: [
        { name: 'Scrum', level: 85 },
        { name: 'Agile', level: 90 },
        { name: 'TDD', level: 80 },
        { name: 'Clean Code', level: 85 },
      ]
    }
  ];

  return (
    <section id="skills" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
            Habilidades Técnicas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Conocimientos y tecnologías que domino y utilizo en mis proyectos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="text-primary-500 mr-3">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {category.title}
                </h3>
              </div>

              <div className="space-y-4">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {skill.level}%
                      </span>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                    >
                      <div className="h-full bg-primary-500 rounded-full" />
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Aprendizaje Continuo
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Me mantengo actualizado con las últimas tendencias y tecnologías en el desarrollo de software, participando en comunidades técnicas y cursos de actualización profesional.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills; 