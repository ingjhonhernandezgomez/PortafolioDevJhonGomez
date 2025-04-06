import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

const Hero = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      icon: <FiGithub />,
      href: 'https://github.com/ingjhonhernandezgomez',
    },
    {
      name: 'LinkedIn',
      icon: <FiLinkedin />,
      href: 'https://www.linkedin.com/in/jhon-gomez-139a2a1a2/',
    },
    {
      name: 'Email',
      icon: <FiMail />,
      href: 'mailto:ing.jhonhernandezgomez@gmail.com',
    },
  ];

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <motion.h1
            className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Jhon Hernández Gómez
          </motion.h1>
          
          <motion.h2
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Desarrollador Full Stack
          </motion.h2>

          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Creando soluciones digitales innovadoras con las últimas tecnologías
          </motion.p>

          <motion.div
            className="flex justify-center space-x-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {link.icon}
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <a
              href="#contact"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-full transition-colors"
            >
              Contáctame
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 