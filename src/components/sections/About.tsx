import { motion } from 'framer-motion';
import { FiCode, FiCpu, FiDatabase, FiLayers, FiUsers } from 'react-icons/fi';

const About = () => {
  const skills = [
    {
      icon: <FiCode />,
      title: 'Desarrollo Full Stack',
      description: 'Experiencia en desarrollo de aplicaciones web completas usando tecnologías modernas como React, Node.js y bases de datos SQL/NoSQL.'
    },
    {
      icon: <FiCpu />,
      title: 'Arquitectura de Software',
      description: 'Capacidad para diseñar y mantener arquitecturas de software escalables y mantenibles, siguiendo las mejores prácticas y patrones de diseño.'
    },
    {
      icon: <FiDatabase />,
      title: 'Gestión de Datos',
      description: 'Experiencia en diseño y optimización de bases de datos, implementación de APIs RESTful y manejo de datos en tiempo real.'
    },
    {
      icon: <FiLayers />,
      title: 'DevOps',
      description: 'Conocimientos en CI/CD, despliegue de aplicaciones, contenedorización con Docker y gestión de infraestructura en la nube.'
    },
    {
      icon: <FiUsers />,
      title: 'Trabajo en Equipo',
      description: 'Excelentes habilidades de comunicación y colaboración, experiencia trabajando en equipos ágiles y multidisciplinarios.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
            Sobre Mí
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ingeniero de Sistemas con 3 años de experiencia en desarrollo de software, apasionado por crear soluciones tecnológicas innovadoras y eficientes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl text-primary-500 mb-4">
                {skill.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {skill.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {skill.description}
              </p>
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
            Mi Enfoque
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Me especializo en crear soluciones tecnológicas que no solo resuelven problemas, sino que también mejoran la experiencia del usuario y optimizan los procesos empresariales. Mi enfoque combina la creatividad con la eficiencia técnica, asegurando que cada proyecto cumpla con los más altos estándares de calidad y rendimiento.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About; 