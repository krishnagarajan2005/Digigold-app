import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft,
  Wallet,
  History,
  Info,
  Phone,
  Home as HomeIcon,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface UserData {
  username: string;
  email: string;
  wallet_balance: number;
  gold_balance: number;
}

interface Transaction {
  id: number;
  type: 'BUY' | 'SELL';
  amount: number;
  gold_quantity: number;
  price_per_gram: number;
  timestamp: string;
}

// --- Components ---

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-8 h-12">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "border-gold-500 text-gold-600"
                  : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
              )}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Header = ({ user, onLogout, onAuthOpen }: { user: any, onLogout: () => void, onAuthOpen: (type: 'login' | 'signup') => void }) => {
  return (
    <header className="bg-stone-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 gold-gradient rounded-lg flex items-center justify-center shadow-lg">
              <Coins className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">
              Digi<span className="text-gold-400">Gold</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-stone-800 px-3 py-1.5 rounded-full border border-stone-700">
                  <User className="w-4 h-4 text-gold-400" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-400 hover:text-white"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onAuthOpen('login')}
                  className="text-sm font-medium text-stone-300 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => onAuthOpen('signup')}
                  className="bg-gold-500 hover:bg-gold-600 text-stone-950 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-gold-500/20"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const AuthModal = ({ isOpen, type, onClose, onSuccess }: { isOpen: boolean, type: 'login' | 'signup', onClose: () => void, onSuccess: (data: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = type === 'login' ? { email, password } : { username, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        if (type === 'login') {
          localStorage.setItem('token', data.token);
          onSuccess(data.user);
          onClose();
        } else {
          // Switch to login after signup
          alert('Account created! Please login.');
          onClose();
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  {type === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {type === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                      placeholder="johndoe"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gold-gradient text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-gold-500/40 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : type === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Pages ---

const Home = ({ user, goldPrice }: { user: any, goldPrice: number }) => {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setProfile(data);
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTransactions();
    }
  }, [user]);

  const handleTrade = async (type: 'buy' | 'sell') => {
    const token = localStorage.getItem('token');
    if (!token || !amount) return;

    setLoading(true);
    const numAmount = parseFloat(amount);
    const goldQuantity = numAmount / goldPrice;

    try {
      const res = await fetch(`/api/gold/${type}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: numAmount,
          goldQuantity,
          pricePerGram: goldPrice
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchProfile();
        fetchTransactions();
        setAmount('');
        alert(`Successfully ${type === 'buy' ? 'bought' : 'sold'} gold!`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Trade failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-20 pb-20">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center overflow-hidden bg-stone-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#f59e0b,transparent_70%)]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">
                Secure Your Future with <span className="text-gold-400">Digital Gold</span>
              </h1>
              <p className="text-xl text-stone-400 mb-8 max-w-lg">
                The smartest way to invest in 24K pure gold. Start with as little as $1. Instant liquidity, secure storage, and real-time prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-gold-500 hover:bg-gold-600 text-stone-950 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-gold-500/20">
                  Start Investing
                </button>
                <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 rounded-xl">
                  <div className="text-sm text-stone-400">Live Price</div>
                  <div className="text-2xl font-mono font-bold text-gold-400">${goldPrice.toFixed(2)}/g</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="w-full aspect-square gold-gradient rounded-full blur-[120px] opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <img 
                src="https://picsum.photos/seed/gold-bars/800/800" 
                alt="Gold Bars" 
                className="relative z-10 rounded-3xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-stone-900 mb-4">Why Choose DigiGold?</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">We provide a secure and transparent platform for all your gold investment needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: '24K Pure Gold', desc: 'Invest in 99.9% pure gold certified by international standards.', icon: ShieldCheck },
              { title: 'Instant Liquidity', desc: 'Sell your gold anytime and get money instantly in your wallet.', icon: TrendingUp },
              { title: 'Secure Vaults', desc: 'Your gold is stored in world-class, insured physical vaults.', icon: Coins },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-gold-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors">
                  <feature.icon className="w-8 h-8 text-gold-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Stats & Trading */}
        <div className="lg:col-span-2 space-y-8">
          {/* Wallet & Gold Balance */}
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-stone-400 text-sm font-medium mb-1">Wallet Balance</p>
                <h3 className="text-3xl font-bold">${profile?.wallet_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                <div className="mt-4 flex items-center text-emerald-400 text-sm">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>+2.4% this month</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gold-500 rounded-2xl p-6 text-stone-950 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coins className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-gold-900 text-sm font-medium mb-1">Gold Balance</p>
                <h3 className="text-3xl font-bold">{profile?.gold_balance.toFixed(4)} g</h3>
                <p className="mt-4 text-gold-900/70 text-sm font-medium">
                  Value: ${( (profile?.gold_balance || 0) * goldPrice ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Trade Card */}
          <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-stone-900">Trade Gold</h2>
              <div className="bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
                <span className="text-sm text-stone-500 mr-2">Live Price:</span>
                <span className="font-mono font-bold text-gold-600">${goldPrice.toFixed(2)}/g</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Amount ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-stone-400">$</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-8 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all text-xl font-bold"
                    placeholder="0.00"
                  />
                </div>
                {amount && (
                  <p className="mt-2 text-sm text-stone-500">
                    You will receive approx. <span className="font-bold text-gold-600">{(parseFloat(amount) / goldPrice).toFixed(4)} g</span> of gold.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTrade('buy')}
                  disabled={loading || !amount}
                  className="flex items-center justify-center space-x-2 bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50"
                >
                  <ArrowDownLeft className="w-5 h-5 text-gold-400" />
                  <span>Buy Gold</span>
                </button>
                <button
                  onClick={() => handleTrade('sell')}
                  disabled={loading || !amount}
                  className="flex items-center justify-center space-x-2 border-2 border-stone-900 text-stone-900 py-4 rounded-xl font-bold hover:bg-stone-50 transition-all disabled:opacity-50"
                >
                  <ArrowUpRight className="w-5 h-5 text-gold-600" />
                  <span>Sell Gold</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: History */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm h-full">
            <div className="flex items-center space-x-2 mb-6">
              <History className="w-5 h-5 text-gold-600" />
              <h2 className="text-xl font-bold text-stone-900">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-stone-400">
                  <p>No transactions yet.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        tx.type === 'BUY' ? "bg-emerald-100 text-emerald-600" : "bg-gold-100 text-gold-600"
                      )}>
                        {tx.type === 'BUY' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{tx.type === 'BUY' ? 'Bought' : 'Sold'} Gold</p>
                        <p className="text-xs text-stone-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-900">${tx.amount.toFixed(2)}</p>
                      <p className="text-xs text-stone-500">{tx.gold_quantity.toFixed(4)} g</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {transactions.length > 0 && (
              <button className="w-full mt-6 text-sm font-bold text-gold-600 hover:text-gold-700 flex items-center justify-center group">
                View All History
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const About = () => (
  <div className="max-w-4xl mx-auto px-4 py-20">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="text-center">
        <h1 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-6">Our Mission</h1>
        <p className="text-xl text-stone-500 leading-relaxed">
          At DigiGold, we believe that wealth preservation should be accessible to everyone. Our platform bridges the gap between traditional gold investment and modern digital finance.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <img 
          src="https://picsum.photos/seed/trust/600/400" 
          alt="Trust" 
          className="rounded-2xl shadow-xl"
          referrerPolicy="no-referrer"
        />
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-stone-900">Transparency & Trust</h2>
          <p className="text-stone-600">
            Every gram of gold you buy is backed by physical 24K gold stored in secure, insured vaults. We provide real-time tracking and instant liquidity, ensuring you are always in control of your assets.
          </p>
          <ul className="space-y-3">
            {['Insured Storage', 'Certified 24K Gold', 'Instant Buy/Sell', 'Low Entry Barrier'].map((item, i) => (
              <li key={i} className="flex items-center space-x-2 text-stone-700">
                <ShieldCheck className="w-5 h-5 text-gold-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  </div>
);

const Contact = () => (
  <div className="max-w-7xl mx-auto px-4 py-20">
    <div className="grid lg:grid-cols-2 gap-16">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Get in Touch</h1>
          <p className="text-stone-500 text-lg">Have questions about digital gold? Our team of experts is here to help you navigate your investment journey.</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Call Us</h3>
              <p className="text-stone-500">+1 (555) 123-4567</p>
              <p className="text-stone-400 text-sm">Mon-Fri, 9am - 6pm EST</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900">Support Email</h3>
              <p className="text-stone-500">support@digigold.com</p>
              <p className="text-stone-400 text-sm">24/7 Response Time</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xl"
      >
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-gold-500 outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-gold-500 outline-none" placeholder="john@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Subject</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-gold-500 outline-none" placeholder="Investment Inquiry" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
            <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-gold-500 outline-none" placeholder="How can we help you?"></textarea>
          </div>
          <button className="w-full gold-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-gold-500/40 transition-all">
            Send Message
          </button>
        </form>
      </motion.div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean, type: 'login' | 'signup' }>({ isOpen: false, type: 'login' });
  const [goldPrice, setGoldPrice] = useState(65.42);

  // Simulate live gold price
  useEffect(() => {
    const interval = setInterval(() => {
      setGoldPrice(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.username) setUser(data);
        else localStorage.removeItem('token');
      })
      .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onAuthOpen={(type) => setAuthModal({ isOpen: true, type })} 
        />
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={user} goldPrice={goldPrice} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Coins className="text-gold-500 w-6 h-6" />
                  <span className="text-xl font-serif font-bold text-white">DigiGold</span>
                </div>
                <p className="max-w-sm">
                  The world's most trusted platform for digital gold investment. Secure, transparent, and accessible to everyone.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><Link to="/" className="hover:text-gold-400 transition-colors">Home</Link></li>
                  <li><Link to="/about" className="hover:text-gold-400 transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-gold-400 transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-stone-800 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} DigiGold Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <AuthModal 
          isOpen={authModal.isOpen} 
          type={authModal.type} 
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          onSuccess={(userData) => setUser(userData)}
        />
      </div>
    </Router>
  );
}
