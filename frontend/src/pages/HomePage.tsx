/**
 * Home / Landing Page
 * Features the hero section and key value propositions.
 */

import { Link } from 'react-router-dom';
import { Recycle, Shield, Leaf, TrendingUp, RotateCcw, Store } from 'lucide-react';

const features = [
  {
    icon: Recycle,
    title: 'AI-Powered Returns',
    description: 'Smart condition assessment determines the best second life for every returned product.',
    link: '/return',
  },
  {
    icon: Shield,
    title: 'Fraud Prevention',
    description: 'Live verification, image hashing, and trust scoring prevent return fraud.',
    link: '/return',
  },
  {
    icon: Store,
    title: 'Certified Marketplace',
    description: 'Shop refurbished products with AI inspection reports and trust badges.',
    link: '/marketplace',
  },
  {
    icon: Leaf,
    title: 'Green Credits',
    description: 'Earn sustainability rewards for donating, recycling, and reselling.',
    link: '/green-credits',
  },
  {
    icon: TrendingUp,
    title: 'Return Prevention',
    description: 'AI predicts return risk and helps customers make better purchase decisions.',
    link: '/dashboard',
  },
  {
    icon: RotateCcw,
    title: 'Peer-to-Peer Exchange',
    description: 'Sell directly to other buyers with AI-verified condition reports.',
    link: '/peer-to-peer',
  },
];

const stats = [
  { label: 'Products Given Second Life', value: '15,847' },
  { label: 'CO₂ Reduced (kg)', value: '123,450' },
  { label: 'Cost Savings', value: '$2.8M' },
  { label: 'Fraud Prevented', value: '342' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amazon-navy to-amazon-navy-light text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-6">
            <Recycle className="h-16 w-16 text-amazon-orange" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Every Product Deserves a{' '}
            <span className="text-amazon-orange">Second Life</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            AI-powered circular commerce that reduces waste, recovers value, 
            and rewards sustainability. Transform returns into opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/return" className="btn-primary text-lg py-3 px-8">
              Start a Return
            </Link>
            <Link to="/marketplace" className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-amazon-navy">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          The Complete Circular Commerce Platform
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, link }) => (
            <Link
              key={title}
              to={link}
              className="card hover:shadow-lg hover:border-amazon-orange/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-amazon-orange/10 group-hover:bg-amazon-orange/20 transition-colors">
                  <Icon className="h-6 w-6 text-amazon-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amazon-orange/5 border-t">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Join the Circular Commerce Revolution
          </h2>
          <p className="text-gray-600 mb-8">
            Every returned product is an opportunity — to save money, reduce waste, and build a more sustainable future.
          </p>
          <Link to="/green-credits" className="btn-primary text-lg py-3 px-8">
            See Your Sustainability Impact
          </Link>
        </div>
      </section>
    </div>
  );
}
