import { motion } from 'framer-motion';
import { FiMail, FiLinkedin, FiGithub, FiMapPin } from 'react-icons/fi';

const Contact = () => {
  const contactMethods = [
    {
      label: 'Email',
      value: 'ing.jhonhernandezgomez@gmail.com',
      href: 'mailto:ing.jhonhernandezgomez@gmail.com',
      icon: <FiMail className="w-6 h-6" />
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/jhon-gomez-139a2a1a2',
      href: 'https://www.linkedin.com/in/jhon-gomez-139a2a1a2/',
      icon: <FiLinkedin className="w-6 h-6" />
    },
    {
      label: 'GitHub',
      value: 'github.com/ingjhonhernandezgomez',
      href: 'https://github.com/ingjhonhernandezgomez',
      icon: <FiGithub className="w-6 h-6" />
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
              Conectemos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              ¿Tienes una idea, proyecto o vacante disponible? Estoy listo para colaborar y construir experiencias digitales de alto impacto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {contactMethods.map((method) => (
                <motion.a
                  key={method.label}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center p-5 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-gray-700 dark:text-gray-200"
                  whileHover={{ y: -4 }}
                >
                  <span className="mr-4 text-primary-500">
                    {method.icon}
                  </span>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {method.label}
                    </p>
                    <p className="font-semibold break-all">
                      {method.value}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  ¿Prefieres una reunión?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Agenda una llamada para conversar sobre cómo puedo ayudar a tu equipo a construir soluciones escalables y centradas en el usuario.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <FiMapPin className="mr-3" />
                  <span>Colombia · Disponible para trabajo remoto</span>
                </div>
                <a
                  href="mailto:ing.jhonhernandezgomez@gmail.com?subject=Consulta%20-%20Portafolio%20DevJhonGomez"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors"
                >
                  Agenda una reunión
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
