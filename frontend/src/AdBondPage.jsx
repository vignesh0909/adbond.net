import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/navbar';
import {
  Send, ArrowRight, CheckCircle, Database, MapPin, Zap, DollarSign, Award, Star,
  ThumbsUp, MessageCircle, Edit3, TrendingUp, Instagram, User, Heart,
} from 'lucide-react';

const AdBondPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      {/* Header */}
      <Navbar />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-violet-600/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative text-center pt-16 px-4 mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
              Where Trust
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
              Binds the affliate world
            </span>
          </h1>

          <p className="mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-xl sm:text-2xl leading-relaxed font-medium">
            Built for <span className="text-blue-600 dark:text-blue-400 font-semibold">advertisers</span>, <span className="text-purple-600 dark:text-purple-400 font-semibold">networks</span>, and <span className="text-indigo-600 dark:text-indigo-400 font-semibold">affiliates</span> unite to build transparent partnerships and drive exceptional results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="/writereview"
              className="group relative w-full sm:w-72 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-center whitespace-nowrap"
            >
              <span className="relative z-10">Write a Review</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            <a
              href="/wishlist"
              className="group relative w-full sm:w-72 px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-900 dark:text-gray-100 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center whitespace-nowrap"
            >
              <span className="relative z-10">Affiliates Wishlist</span>
            </a>
            <Link
              to="/register-entity"
              className="group relative w-full sm:w-72 px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-center whitespace-nowrap"
            >
              <span className="relative z-10">Advertisers Showcase</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Affiliate Offer Requests */}
      <section className="relative px-4 sm:px-6 lg:px-20 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Trending Requests</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Popular Offer Requests
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what affiliates are looking for and connect with potential partners
            </p>
          </div>

          {/* Requests Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Health & Wellness Offers',
                geo: 'US, CA, UK',
                traffic: 'Meta Ads + Google',
                budget: '$50K+',
                volume: '75K/day',
                urgency: 'High'
              },
              {
                title: 'Finance & Crypto',
                geo: 'UK, DE, AU',
                traffic: 'Native + Push',
                budget: '$25K+',
                volume: '45K/day',
                urgency: 'Medium'
              },
              {
                title: 'Gaming & Apps',
                geo: 'Global',
                traffic: 'Social + Video',
                budget: '$75K+',
                volume: '100K/day',
                urgency: 'High'
              }
            ].map((request, i) => (
              <div
                key={i}
                className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2"
              >
                {/* Request Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-xl mb-2 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {request.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Target GEO:</span>
                        <div className="text-gray-600 dark:text-gray-300">{request.geo}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Traffic Type:</span>
                        <div className="text-gray-600 dark:text-gray-300">{request.traffic}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Budget:</span>
                        <div className="text-green-600 dark:text-green-400 font-bold">{request.budget}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Volume:</span>
                        <div className="text-gray-600 dark:text-gray-300">{request.volume}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    I have this Offer
                    <ArrowRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              to="/wishlist"
              className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              View All Requests
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      {/* Reviews */}
      <section className="relative px-4 sm:px-6 lg:px-20 pt-20" id="reviews">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-teal-500/10 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-full px-4 py-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">Trusted Reviews</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                What Our Community Says
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real feedback from real people building real partnerships
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "AffiliateX",
                role: "Publisher",
                avatar: "AX",
                rating: 5,
                feedback: "Outstanding platform! The offer quality is exceptional and payments are always on time. The review system helps build genuine trust.",
                verified: true,
                date: "2 days ago"
              },
              {
                name: "NetworkABC",
                role: "Network",
                avatar: "NA",
                rating: 5,
                feedback: "Game-changer for our network operations. Fast payments, helpful account managers, and the best affiliate tools we've used.",
                verified: true,
                date: "1 week ago"
              },
              {
                name: "Digital Marketing Pro",
                role: "Advertiser",
                avatar: "DM",
                rating: 4,
                feedback: "Fantastic ROI and high-quality traffic. The platform's transparency features give us confidence in our partnerships.",
                verified: true,
                date: "3 days ago"
              }
            ].map((review, i) => (
              <div
                key={i}
                className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2"
              >
                {/* Verified Badge */}
                {review.verified && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Reviewer Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-sm">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {review.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{review.role}</span>
                      {review.verified && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={`w-5 h-5 ${starIndex < review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
                </div>

                {/* Review Text */}
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base">
                  "{review.feedback}"
                </p>

                {/* Action Buttons */}
                {/* <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform group-hover:scale-105">
                    <ThumbsUp className="inline-block w-3 h-3 mr-1" />
                    Helpful
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300">
                    <MessageCircle className="inline-block w-3 h-3 mr-1" />
                    Reply
                  </button>
                </div> */}

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              to="/write-review"
              className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Write a Review
              <Edit3 className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      {/* Industry Database */}
      <section className="relative px-4 sm:px-6 lg:px-20 py-20" id="database">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 rounded-full px-4 py-2 mb-6">
              <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Verified Database</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Affiliate Industry Database
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Access our comprehensive database of 70,000+ verified companies with full identity verification
            </p>
          </div>

          {/* Database Preview Cards */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {[
              {
                name: 'ClickHub Media',
                type: 'Network',
                verified: true,
                members: '2,500+',
                rating: 4.8,
                specialties: ['Performance Marketing', 'Lead Generation'],
                founded: '2018'
              },
              {
                name: 'AdServePro',
                type: 'Advertiser',
                verified: true,
                members: '890+',
                rating: 4.6,
                specialties: ['E-commerce', 'Mobile Apps'],
                founded: '2020'
              },
              {
                name: 'GlobalAffiliate Network',
                type: 'Network',
                verified: true,
                members: '5,200+',
                rating: 4.9,
                specialties: ['International Markets', 'Crypto'],
                founded: '2016'
              }
            ].map((entry, i) => (
              <div
                key={i}
                className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2"
              >
                {/* Verified Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">Verified</span>
                </div>

                {/* Company Logo Placeholder */}
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-white font-black text-xl">{entry.name.split(' ').map(word => word[0]).join('').slice(0, 2)}</span>
                </div>

                {/* Company Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-xl mb-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {entry.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${entry.type === 'Network'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                        {entry.type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Since {entry.founded}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Members</div>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">{entry.members}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Rating</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-gray-900 dark:text-gray-100">{entry.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Specialties</div>
                    <div className="flex flex-wrap gap-1">
                      {entry.specialties.map((specialty, j) => (
                        <span key={j} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-lg">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Database Stats */}
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-3xl p-8 text-white text-center">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-black mb-2">70,000+</div>
                <div className="text-indigo-100">Verified Companies</div>
              </div>
              <div>
                <div className="text-3xl font-black mb-2">150+</div>
                <div className="text-indigo-100">Countries Covered</div>
              </div>
              <div>
                <div className="text-3xl font-black mb-2">99.8%</div>
                <div className="text-indigo-100">Data Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-black mb-2">24/7</div>
                <div className="text-indigo-100">Support Access</div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                to="/affliate-industry"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                Explore Full Database
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-20 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-red-600/10 to-pink-600/10 rounded-3xl"></div>

          <div className="relative">
            {/* Status indicator */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 rounded-full px-6 py-2 mb-8 shadow-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Start Your Journey</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  Ready to Build Trust?
                </span>
                <br />
                <span className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Choose Your Path Forward
                </span>
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Whether you're an affiliate seeking quality offers, an advertiser looking for trusted partners, or a network building relationships — start with transparency.
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* For Affiliates */}
              <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  For Affiliates
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Discover verified offers, read authentic reviews, and build your wishlist of dream partnerships.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/offers"
                    className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Browse Offers
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block w-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border-2 border-blue-500 px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300"
                  >
                    Create Wishlist
                  </Link>
                </div>
              </div>

              {/* For Advertisers */}
              <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  For Advertisers
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Showcase your offers, connect with quality affiliates, and build your reputation through verified reviews.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/register-entity"
                    className="block w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Create Profile
                  </Link>
                  <Link
                    to="/advertiserswishlist"
                    className="block w-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-green-600 dark:text-green-400 border-2 border-green-500 px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300"
                  >
                    View Requests
                  </Link>
                </div>
              </div>

              {/* For Everyone */}
              <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  Build Community
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Share experiences, write reviews, and help build a transparent ecosystem for everyone.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/write-review"
                    className="block w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Write Review
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-orange-600 dark:text-orange-400 border-2 border-orange-500 px-6 py-3 rounded-xl font-semibold text-center transition-all duration-300"
                  >
                    Join Platform
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Questions? Connect with our community on Telegram for real-time support and discussions.
              </p>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-2xl text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                <span className="relative z-10 flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Join Telegram Community
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-4 sm:px-6 lg:px-20 py-16 bg-gradient-to-br from-gray-200 via-blue-200 to-indigo-200 border-t border-gray-200/60">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2 bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/assets/AdBond-Logo-1.png"
                  alt="AdBond Logo"
                  className="h-30 w-auto drop-shadow-lg"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Platform</h3>
              <ul className="space-y-2 text-gray-700">
                <li><Link to="/offers" className="hover:text-blue-600 transition-colors font-medium">Browse Offers</Link></li>
                <li><Link to="/wishlist" className="hover:text-blue-600 transition-colors font-medium">Wishlist</Link></li>
                <li><Link to="/write-review" className="hover:text-blue-600 transition-colors font-medium">Write Review</Link></li>
                <li><Link to="/database" className="hover:text-blue-600 transition-colors font-medium">Database</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Support</h3>
              <ul className="space-y-2 text-gray-700">
                <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-white/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <p className="text-gray-700 mb-6 leading-relaxed">
              <strong className="text-gray-900">A Non-Profit Initiative by Fission Inc.</strong> After serving 80+ affiliate marketing clients over the past 15 years, we repeatedly heard one thing: the need for a transparent, fraud-free, and community-owned platform. AdBond was born from those requests — a non-profit initiative by Fission Inc. to give back to the industry that shaped us. Built to eliminate fake traffic, foster trust, and showcase proof-backed reviews, AdBond stands as a decentralized, free alternative to commercial listing sites — driven by real needs, not monetization.
            </p>

            <div className="flex gap-3 mb-6">
              <a href="#" className="group w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
                <Instagram className="w-5 h-5 text-gray-600 group-hover:text-pink-600 transition-colors" />
              </a>
              <a href="#" className="group w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000000" />
                </svg>

              </a>
              <a href="#" className="group w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="group w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black cursor-pointer transition-all duration-300 ease-in-out hover:text-blue-600">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="mt-8 pt-6 border-t border-gray-300/50 bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-700 text-sm font-medium">
                © 2025 AdBond All rights reserved. Built with transparency and trust.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdBondPage;