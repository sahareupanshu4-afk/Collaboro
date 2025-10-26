import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  MessageSquare, 
  PenTool, 
  FileText, 
  Users, 
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Check,
  Menu,
  X,
  Sparkles,
  Rocket,
  Heart,
  Star,
  Lock,
  Cloud,
  Headphones,
  TrendingUp,
  Layers,
  Monitor,
  Briefcase,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize
} from 'lucide-react';

const LandingPage = ({ onSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);

  const features = [
    {
      icon: Video,
      title: 'HD Video Conferencing',
      description: 'Crystal-clear video calls with 1-on-1 and group conference modes',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Instant messaging with workspace members for seamless collaboration',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: PenTool,
      title: 'Interactive Whiteboard',
      description: 'Collaborative drawing tools with shapes, text, and annotations',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: FileText,
      title: 'Document Editor',
      description: 'Rich text editor with formatting, export, and real-time saving',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Team Workspaces',
      description: 'Organize your teams with invite links and member management',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'End-to-end encryption with enterprise-grade security',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '50+', label: 'Countries' },
    { value: '4.9/5', label: 'User Rating' }
  ];

  const demoSteps = [
    {
      title: 'Create Your Workspace',
      description: 'Set up dedicated workspaces for different teams and projects in seconds',
      image: '🏢',
      features: ['Unlimited workspaces', 'Invite team members', 'Organize by projects']
    },
    {
      title: 'Real-time Chat',
      description: 'Instant messaging with your team members with file sharing capabilities',
      image: '💬',
      features: ['Instant messaging', 'File attachments', 'Message history']
    },
    {
      title: 'Video Conferencing',
      description: 'HD video calls with screen sharing for team meetings and presentations',
      image: '📹',
      features: ['HD video quality', '1-on-1 or group calls', 'Screen sharing']
    },
    {
      title: 'Collaborative Whiteboard',
      description: 'Draw, sketch, and brainstorm together in real-time with powerful tools',
      image: '🎨',
      features: ['Drawing tools', 'Shapes & text', 'Save & share']
    },
    {
      title: 'Document Editor',
      description: 'Create and edit rich text documents with your team in real-time',
      image: '📝',
      features: ['Rich text editing', 'Export to HTML', 'Real-time sync']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Collaboro
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">How It Works</a>
              <a href="#use-cases" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">Use Cases</a>
              <a href="#security" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">Security</a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSignIn}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
              >
                Sign In
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900 border-t border-gray-800"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-gray-300 hover:text-cyan-400 transition-colors font-medium">Features</a>
                <a href="#how-it-works" className="block text-gray-300 hover:text-cyan-400 transition-colors font-medium">How It Works</a>
                <a href="#use-cases" className="block text-gray-300 hover:text-cyan-400 transition-colors font-medium">Use Cases</a>
                <a href="#security" className="block text-gray-300 hover:text-cyan-400 transition-colors font-medium">Security</a>
                <button
                  onClick={onSignIn}
                  className="w-full px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold shadow-lg shadow-cyan-500/50"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15, 
                delay: 0.2 
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full mb-6 border border-cyan-500/30"
              >
                <Rocket className="w-4 h-4" />
                <span className="text-sm font-semibold">Your Remote Work Platform</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Collaborate
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Anywhere</span>
                , Anytime
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Experience seamless remote collaboration with HD video conferencing, real-time chat, 
                interactive whiteboards, and powerful document editing - all in one platform.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSignIn}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold shadow-xl shadow-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/70 transition-all flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDemoModal(true)}
                  className="px-8 py-4 bg-gray-800 text-gray-200 rounded-full font-semibold border-2 border-gray-700 hover:border-cyan-500 transition-all flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Animated Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15, 
                delay: 0.3 
              }}
              className="relative"
            >
              <div className="relative z-10">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 shadow-2xl shadow-cyan-500/50"
                >
                  <div className="bg-gray-900 rounded-2xl p-6 space-y-4 border border-gray-800">
                    {/* Simulated UI Elements */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-800 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                          className="h-24 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-600"
                        ></motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-10 -right-10 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/50 opacity-80"
              ></motion.div>
              <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl shadow-xl shadow-cyan-500/50 opacity-80"
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 20 
            }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Collaborate</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to make remote work feel natural and productive
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 20, 
                  delay: index * 0.1 
                }}
                whileHover={{ y: -5 }}
                className="bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all border border-gray-700"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for Modern
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Remote Teams</span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Collaboro was created to solve the challenges of remote work. We believe that distance 
                shouldn't limit productivity or creativity. Our platform brings together all the tools 
                your team needs in one beautiful, intuitive interface.
              </p>
              <div className="space-y-4">
                {['Easy to use, powerful features', 'Secure and reliable', 'Always improving'].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-200 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-1 shadow-2xl shadow-cyan-500/50">
                <div className="bg-gray-800 rounded-3xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[Zap, Shield, Globe, Heart].map((Icon, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center border border-gray-600"
                      >
                        <Icon className="w-12 h-12 text-cyan-400 mb-3" />
                        <span className="text-sm font-semibold text-gray-200">
                          {['Fast', 'Secure', 'Global', 'Loved'][i]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 20 
            }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Users,
                title: 'Create Your Workspace',
                description: 'Sign up and create a dedicated workspace for your team. Invite members via email or shareable links.',
                color: 'from-cyan-500 to-blue-600'
              },
              {
                step: '2',
                icon: Layers,
                title: 'Choose Your Tools',
                description: 'Access real-time chat, video calls, whiteboards, and document editors - all in one platform.',
                color: 'from-purple-600 to-indigo-700'
              },
              {
                step: '3',
                icon: Rocket,
                title: 'Start Collaborating',
                description: 'Begin working together seamlessly with real-time updates and instant communication.',
                color: 'from-pink-600 to-rose-700'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 20, 
                  delay: index * 0.2 
                }}
                className="relative"
              >
                <div className="bg-gray-800 rounded-2xl p-8 h-full border border-gray-700 hover:border-cyan-500/50 transition-all">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <span className="text-white font-bold text-xl">{item.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-cyan-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 20 
            }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Perfect For
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Every Team</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Whether you're a startup or enterprise, Collaboro adapts to your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: 'Startups', desc: 'Scale quickly with all tools in one place' },
              { icon: Briefcase, title: 'Enterprises', desc: 'Secure collaboration for large teams' },
              { icon: Monitor, title: 'Remote Teams', desc: 'Work from anywhere, stay connected' },
              { icon: Headphones, title: 'Support Teams', desc: 'Real-time customer support collaboration' }
            ].map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 20, 
                  delay: i * 0.1 
                }}
                whileHover={{ y: -5 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{useCase.title}</h3>
                <p className="text-gray-400 text-sm">{useCase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 20 
            }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Enterprise-Grade
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Security</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your data is protected with industry-leading security measures
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'End-to-End Encryption',
                description: 'All communications are encrypted using AES-256 encryption, ensuring your conversations stay private.',
                features: ['Encrypted messaging', 'Secure file transfer', 'Protected video calls']
              },
              {
                icon: Shield,
                title: 'Data Privacy',
                description: 'We never sell your data. Your information is stored securely and only accessible by your team.',
                features: ['GDPR compliant', 'SOC 2 certified', 'Regular security audits']
              },
              {
                icon: Cloud,
                title: 'Reliable Infrastructure',
                description: 'Built on enterprise-grade cloud infrastructure with 99.9% uptime guarantee.',
                features: ['Auto-backups', 'Disaster recovery', 'Global CDN']
              }
            ].map((security, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 20, 
                  delay: index * 0.1 
                }}
                className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-cyan-500/50 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                  <security.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{security.title}</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">{security.description}</p>
                <ul className="space-y-2">
                  {security.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                      <Check className="w-4 h-4 text-cyan-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring", 
            stiffness: 150, 
            damping: 20 
          }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl shadow-cyan-500/50"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"
          ></motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"
          ></motion.div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Remote Work?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of teams already collaborating on Collaboro
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignIn}
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
            >
              Start Free Today
              <Star className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Interactive Demo</h2>
                    <p className="text-gray-400 text-sm">Explore Collaboro's powerful features</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDemoStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Demo Visual */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-12 text-center border border-gray-600">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-8xl mb-4"
                      >
                        {demoSteps[currentDemoStep].image}
                      </motion.div>
                      <h3 className="text-3xl font-bold text-white mb-3">
                        {demoSteps[currentDemoStep].title}
                      </h3>
                      <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        {demoSteps[currentDemoStep].description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {demoSteps[currentDemoStep].features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-gray-200 font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer - Navigation */}
              <div className="p-6 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {demoSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDemoStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentDemoStep
                          ? 'w-8 bg-gradient-to-r from-cyan-500 to-blue-600'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">
                    {currentDemoStep + 1} / {demoSteps.length}
                  </span>
                  <button
                    onClick={() => setCurrentDemoStep((prev) => (prev > 0 ? prev - 1 : prev))}
                    disabled={currentDemoStep === 0}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {currentDemoStep < demoSteps.length - 1 ? (
                    <button
                      onClick={() => setCurrentDemoStep((prev) => prev + 1)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      Next
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowDemoModal(false);
                        onSignIn();
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all flex items-center gap-2"
                    >
                      Get Started Now
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer id="contact" className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Collaboro</span>
              </div>
              <p className="text-gray-500">
                Making remote work seamless and productive for teams worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Collaboro. All rights reserved. Made with <Heart className="w-4 h-4 inline text-red-500" /> for remote teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
