import React, { useState } from 'react';
import { Product, Partner } from '../types';
import { 
  ArrowLeft, ShoppingBag, CheckCircle, Video, Award, ShieldCheck, 
  MapPin, Play, Star, Info, MessageSquare, Heart, Share2, AlertCircle, ShoppingCart, HelpCircle,
  Phone
} from 'lucide-react';

interface ProductDetailsPageProps {
  product: Product;
  onBack: () => void;
  addToCart: (product: Product, quantity?: number, openCart?: boolean) => void;
  handleQuickBuyNow: (product: Product) => void;
  setPriceFormat: (amount: number) => string;
  lang: 'bn' | 'en';
  partners: Partner[];
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  onBack,
  addToCart,
  handleQuickBuyNow,
  setPriceFormat,
  lang,
  partners
}) => {
  const [activeImg, setActiveImg] = useState<string>(product.images[0]);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'sourcing' | 'qa'>('benefits');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Review states
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: lang === 'bn' ? 'মুফতি হারুনুর রশীদ' : 'Mufti Harunur Rashid',
      role: lang === 'bn' ? 'সম্মানিত খতিব' : 'Community Imam',
      rating: 5,
      date: '2026-05-18',
      comment: lang === 'bn' 
        ? 'আমি নিজে এই মধুর গুণগত মান পরীক্ষা করেছি। সুন্দরবনের খাঁটি খলিশা মধুর অনন্য স্বাদ এবং প্রাকৃতিক দানাদার জমিন চমৎকার।' 
        : 'I have personally verified this honey quality. The natural crystallization and taste are truly authentic.',
      verified: true
    },
    {
      id: 2,
      author: lang === 'bn' ? 'ডঃ আশরাফুল আলম' : 'Dr. Ashraful Alam',
      role: lang === 'bn' ? 'খাদ্য গবেষক' : 'Food Chemist',
      rating: 5,
      date: '2026-05-28',
      comment: lang === 'bn' 
        ? 'ল্যাব টেস্ট রিপোর্টে সুক্রোজের পরিমাণ শূন্য পাওয়া গেছে, যা প্রাকৃতিকভাবে মৌচাক থেকে পাওয়া খাঁটি মধুর বৈশিষ্ট্য।' 
        : 'Lab analytics show zero added sucrose. This conforms to the highest standards of wild raw honey.',
      verified: true
    },
    {
      id: 3,
      author: lang === 'bn' ? 'আরিফুর রহমান' : 'Arifur Rahman',
      role: lang === 'bn' ? 'সাধারণ ক্রেতা' : 'Verified Buyer',
      rating: 5,
      date: '2026-06-02',
      comment: lang === 'bn' 
        ? 'পরিবারের জন্য সবসময় এখান থেকেই ঘি আর মধু নেওয়া হয়। খাঁটি জিনিসের নিশ্চয়তা।' 
        : 'Always purchase my family honey and ghee here. Absolute trust in purity.',
      verified: true
    }
  ]);

  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Q&A states
  const [questions, setQuestions] = useState([
    {
      id: 1,
      user: lang === 'bn' ? 'মো: জসিম উদ্দিন' : 'Md. Jasim Uddin',
      question: lang === 'bn' 
        ? 'ডায়াবেটিস রোগীরা কি এই মধু খেতে পারবেন?' 
        : 'Can diabetic patients consume this honey?',
      answer: lang === 'bn' 
        ? 'উত্তর (মাওলানা মুফতি আব্দুর রহমান, ইমাম): ওয়া আলাইকুমুস সালাম। এটি শতভাগ খাঁটি ও চিনিমুক্ত প্রাকৃতিকভাবে সংগৃহীত মধু। অল্প পরিমাণে খাওয়া নিরাপদ, তবে আপনার ব্যক্তিগত চিকিৎসকের পরামর্শ নেওয়া উত্তম।' 
        : 'Answer (Maulana Mufti Abdur Rahman, Imam): Raw wild honey has a lower GI than processed sugar, so modest quantities are usually safe. However, please consult your healthcare physician first.',
      date: '2026-06-01'
    },
    {
      id: 2,
      user: lang === 'bn' ? 'সায়মা আক্তার' : 'Saima Akter',
      question: lang === 'bn' 
        ? 'মধুটি জমে যাওয়া কি ভেজালের লক্ষণ?' 
        : 'Does crystallization indicate adulteration?',
      answer: lang === 'bn' 
        ? 'উত্তর (ল্যাব টিম): জি না। খাঁটি খলিশা মধু এবং সরিষা মধু নির্দিষ্ট তাপমাত্রায় জমে যাওয়া (দানাদার হওয়া) একটি সম্পূর্ণ সাধারণ বৈজ্ঞানিক ও প্রাকৃতিক প্রক্রিয়া।' 
        : 'Answer (Lab Team): Not at all. Crystallization is a natural occurrence in premium raw honey and is scientific proof of its unprocessed natural state.',
      date: '2026-06-04'
    }
  ]);

  const [newQuestionText, setNewQuestionText] = useState('');

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    const author = newReviewName.trim() || (lang === 'bn' ? 'বেনামী ক্রেতা' : 'Anonymous Buyer');
    const role = lang === 'bn' ? 'ক্রেতা' : 'Customer';
    const nextReview = {
      id: Date.now(),
      author,
      role,
      rating: newReviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: newReviewComment.trim(),
      verified: true
    };
    setReviews([nextReview, ...reviews]);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  const submitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const nextQuestion = {
      id: Date.now(),
      user: lang === 'bn' ? 'সম্মানিত সুধী' : 'Valued Customer',
      question: newQuestionText.trim(),
      answer: lang === 'bn' 
        ? 'উত্তর: ধন্যবাদ আপনার জিজ্ঞাসার জন্য। আমাদের স্থানীয় ডিলার ও ইমাম অংশীদার খুব শীঘ্রই আপনার প্রশ্নের জবাব দেবেন।' 
        : 'Answer: Thank you for your inquiry. Our regional partner Imam and scholar team will reply shortly.',
      date: new Date().toISOString().split('T')[0]
    };
    setQuestions([...questions, nextQuestion]);
    setNewQuestionText('');
  };

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800 font-sans pb-16">
      {/* Detail Area Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs border border-stone-200 transition-all cursor-pointer group mb-6"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-800 group-hover:-translate-x-0.5 transition-transform" />
          <span>{lang === 'bn' ? 'পণ্য তালিকায় ফিরে যান' : 'Back to Collection'}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Showcase (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-stone-200/60 shadow-xs">
            {/* Aspect Ratio 4:3 Box for main media */}
            <div className="relative aspect-4/3 bg-stone-50 rounded-2xl overflow-hidden mb-3 border border-stone-100">
              {isVideoPlaying ? (
                <video 
                  src={product.videoUrl} 
                  className="w-full h-full object-cover" 
                  controls 
                  autoPlay 
                  playsInline
                />
              ) : (
                <img 
                  src={activeImg} 
                  alt={product.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              )}

              {/* Shari'ah Endorsement Ribbons */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.certificationStatus.imamVerified && (
                  <span className="bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    {lang === 'bn' ? 'ইমাম অনুমোদিত' : 'Sunnah Endorsed'}
                  </span>
                )}
                {product.certificationStatus.labTested && (
                  <span className="bg-stone-900/90 text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {lang === 'bn' ? 'ল্যাব বিশ্লেষিত' : 'Lab Certified'}
                  </span>
                )}
              </div>

              {!isVideoPlaying && (
                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute bottom-3 left-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] uppercase py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
                >
                  <Video className="w-4 h-4" />
                  {lang === 'bn' ? 'সোর্সিং প্রুফ ভিডিও' : 'Harvesting Proof'}
                </button>
              )}
            </div>

            {/* Gallery Thumbnails (at least 3 images required by product metadata) */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  id={`details-page-img-thumb-${i}`}
                  onClick={() => {
                    setActiveImg(img);
                    setIsVideoPlaying(false);
                  }}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === img && !isVideoPlaying 
                      ? 'border-emerald-700' 
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} referrerPolicy="no-referrer" />
                </button>
              ))}

              {/* Video thumbnail as an alternative selector */}
              <button
                id="details-page-video-thumb"
                onClick={() => setIsVideoPlaying(true)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all bg-emerald-950 flex flex-col items-center justify-center relative ${
                  isVideoPlaying ? 'border-emerald-700' : 'border-stone-200 opacity-80'
                }`}
              >
                <Play className="w-6 h-6 text-amber-300" />
                <span className="text-[8px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5 font-mono">
                  {lang === 'bn' ? 'ভিডিও' : 'Live'}
                </span>
              </button>
            </div>
          </div>

          {/* Sourcing Geographical Origin Stamp */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/60 shadow-xs space-y-3">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              📍 {lang === 'bn' ? 'সোর্সিং লজিস্টিকস ট্র্যাক' : 'Geographic Traceability'}
            </span>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-stone-100 rounded-xl">
                <MapPin className="w-6 h-6 text-amber-700" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-slate-800">{lang === 'bn' ? 'পণ্য সোর্সিং পয়েন্ট' : 'Source Node'}</h4>
                <p className="text-xs text-stone-500">{product.origin}</p>
              </div>
            </div>
            <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-amber-100 text-left">
              <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
                {lang === 'bn'
                  ? 'এই পণ্যটি সরাসরি উৎসস্থল থেকে সংগৃহীত হয়েছে এবং স্থানীয় ইমাম অংশীদারদের উপস্থিতিতে ল্যাব টেস্টের নমুনা সিলকৃত করা হয়েছিল।'
                  : 'This item is direct farm-gate trace verified. Under strict Shari\'ah compliance, our local Imam sealed the batch right after cold harvesting.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Specs & Commerce Actions (Span 7) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Main Info Box */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/60 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 rounded-lg uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  {product.sku}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full border transition-all ${
                    isLiked ? 'bg-red-50 text-red-500 border-red-200' : 'bg-stone-50 text-stone-400 hover:text-stone-600 border-stone-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full border bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200 transition-colors relative"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                      {lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <h1 className="text-xl md:text-3xl font-display font-extrabold text-stone-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3.5 mt-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-stone-500">
                  ({product.rating}.0 / {product.reviewsCount} {lang === 'bn' ? 'টি মন্তব্য' : 'reviews'})
                </span>
                <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  🛡️ {lang === 'bn' ? '১০০% বিশুদ্ধতার নিশ্চয়তা' : '100% Purity'}
                </span>
              </div>
            </div>

            {/* Custom pricing display */}
            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-stone-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-400 font-bold block mb-1">
                  {lang === 'bn' ? 'রিসার্চ রিটেইল প্রাইস:' : 'Direct Retail Price:'}
                </span>
                <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display">
                  {setPriceFormat(product.price)}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-stone-400 font-bold block mb-1">
                  {lang === 'bn' ? 'স্টক স্থিতি:' : 'Inventory Status:'}
                </span>
                <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-md inline-block ${
                  product.stockQty <= 5 
                    ? 'bg-red-50 text-red-600 border border-red-100' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                }`}>
                  {lang === 'bn' 
                    ? `মাত্র ${product.stockQty} টি পণ্য স্টকে উপলব্ধ` 
                    : `${product.stockQty} Units in Stock`}
                </span>
              </div>
            </div>

            {/* Quantity Selector & Quick Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-600">
                  {lang === 'bn' ? 'পরিমাণ নির্বাচন:' : 'Choose Quantity:'}
                </span>
                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden">
                  <button 
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="px-4 py-2 hover:bg-stone-100 text-stone-600 font-extrabold text-sm transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-5 font-mono font-bold text-sm text-stone-800">
                    {selectedQuantity}
                  </span>
                  <button 
                    onClick={() => setSelectedQuantity(Math.min(product.stockQty, selectedQuantity + 1))}
                    className="px-4 py-2 hover:bg-stone-100 text-stone-600 font-extrabold text-sm transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  id="details-page-btn-buy"
                  onClick={() => {
                    // Update quantity inside the cart or buy directly
                    // We will set selected quantity first
                    addToCart(product, selectedQuantity, false);
                    handleQuickBuyNow(product);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-4 px-6 rounded-2xl text-xs sm:text-sm shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-amber-300" />
                  {lang === 'bn' ? 'এখনই কিনুন (সরাসরি পেমেন্ট)' : 'Direct Checkout Now'}
                </button>
                <button
                  id="details-page-btn-cart"
                  onClick={() => addToCart(product, selectedQuantity, true)}
                  className="border-2 border-emerald-700 hover:bg-emerald-50 text-emerald-800 font-extrabold py-4 px-6 rounded-2xl text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {lang === 'bn' ? 'শপিং ব্যাগে যোগ করুন' : 'Add to Shopping Bag'}
                </button>
              </div>

              {/* Dynamic Instant Outreach: WhatsApp & Call-for-order Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  id="details-page-btn-whatsapp"
                  href={`https://wa.me/8801712345678?text=${encodeURIComponent(
                    lang === 'bn'
                      ? `আসসালামু আলাইকুম! আমি ড্যাডিজান থেকে "${product.name}" অর্ডার করতে চাই।\nপরিমাণ: ${selectedQuantity} টি\nমূল্য: ${setPriceFormat(product.price * selectedQuantity)}`
                      : `Assalamu Alaikum! I want to order "${product.name}" from DADAJAN.\nQuantity: ${selectedQuantity}\nPrice: ${setPriceFormat(product.price * selectedQuantity)}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4.5 h-4.5 text-emerald-100" />
                  {lang === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার দিন' : 'Order on WhatsApp'}
                </a>
                <a
                  id="details-page-btn-call"
                  href="tel:+8801712345678"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4.5 h-4.5 text-amber-100" />
                  {lang === 'bn' ? 'ফোনে অর্ডার করতে কল করুন' : 'Call for Order'}
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Information Tabs */}
          <div className="bg-white rounded-3xl border border-stone-200/60 overflow-hidden shadow-xs">
            {/* Tabs Selector Navigation */}
            <div className="border-b border-stone-100 flex overflow-x-auto bg-stone-50 font-mono text-xs">
              <button
                _id="tab-benefits"
                onClick={() => setActiveTab('benefits')}
                className={`flex-1 py-4.5 px-4 font-bold border-b-2 text-center shrink-0 min-w-[120px] transition-all cursor-pointer ${
                  activeTab === 'benefits' 
                    ? 'border-emerald-700 text-emerald-800 bg-white' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                📝 {lang === 'bn' ? 'উপকারিতা ও সুনাহ' : 'Sunnah Benefits'}
              </button>
              <button
                _id="tab-ingredients"
                onClick={() => setActiveTab('ingredients')}
                className={`flex-1 py-4.5 px-4 font-bold border-b-2 text-center shrink-0 min-w-[120px] transition-all cursor-pointer ${
                  activeTab === 'ingredients' 
                    ? 'border-emerald-700 text-emerald-800 bg-white' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                🔬 {lang === 'bn' ? 'বিশ্লেষণ ও উপাদান' : 'Ingredients'}
              </button>
              <button
                _id="tab-sourcing"
                onClick={() => setActiveTab('sourcing')}
                className={`flex-1 py-4.5 px-4 font-bold border-b-2 text-center shrink-0 min-w-[120px] transition-all cursor-pointer ${
                  activeTab === 'sourcing' 
                    ? 'border-emerald-700 text-emerald-800 bg-white' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                🌾 {lang === 'bn' ? 'সোর্সিং ভিডিও প্রুফ' : 'Sourcing Process'}
              </button>
              <button
                _id="tab-qa"
                onClick={() => setActiveTab('qa')}
                className={`flex-1 py-4.5 px-4 font-bold border-b-2 text-center shrink-0 min-w-[120px] transition-all cursor-pointer ${
                  activeTab === 'qa' 
                    ? 'border-emerald-700 text-emerald-800 bg-white' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                💬 {lang === 'bn' ? 'জিজ্ঞাসা ও সমাধান' : 'Q&A Board'}
              </button>
            </div>

            {/* Tab Panel Content Box */}
            <div className="p-6 md:p-8">
              {activeTab === 'benefits' && (
                <div className="space-y-4 text-xs md:text-sm text-stone-600 leading-relaxed">
                  <p className="font-semibold text-stone-900 border-l-4 border-amber-600 pl-3">
                    {lang === 'bn' 
                      ? 'রসূল (সাঃ)-এর নির্দেশিত সুনাহ খাদ্য সমাচার ও বর্ণনা:' 
                      : 'Islamic & Health values conforming to authentic practices:'}
                  </p>
                  <p>{product.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div className="p-3 bg-stone-50 rounded-xl flex items-start gap-2.5 border border-stone-200/50">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs mb-0.5">{lang === 'bn' ? '১০০% প্রাকৃতিক স্যানিটেশন' : '100% Pure Raw State'}</h4>
                        <p className="text-[11px] text-stone-500">{lang === 'bn' ? 'মৌমাছি বা প্রডিউসার থেকে সরাসরি প্যাকিং।' : 'Packaged without thermal heat treatment or processing.'}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl flex items-start gap-2.5 border border-stone-200/50">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs mb-0.5">{lang === 'bn' ? 'পারিবারিক সমৃদ্ধি' : 'Family Safe Nutrition'}</h4>
                        <p className="text-[11px] text-stone-500">{lang === 'bn' ? 'সকল সাধারণ ও প্রবীণ সদস্যদের জন্য নির্দেশিত।' : 'Safe for active youngsters and sunnah compliance families.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="space-y-4 text-xs md:text-sm text-stone-600">
                  <div className="p-4 bg-[#FDFBF7] rounded-xl border border-amber-100 flex gap-3">
                    <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">{lang === 'bn' ? 'পণ্য বিশ্লেষণ ডাটা ও উপাদান' : 'Analytical Ingredients Statement'}</p>
                      <p className="text-[11px] text-stone-600 mt-1">{product.ingredients}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs uppercase mb-2">{lang === 'bn' ? 'অ্যাবসোলুট রিপোর্ট সামারি' : 'Certified Analytical Report'}</h3>
                    <table className="w-full text-left font-mono text-xs border border-stone-150">
                      <tbody>
                        <tr className="border-b border-stone-150 bg-stone-50">
                          <td className="p-2 font-bold text-stone-600">{lang === 'bn' ? 'বিশুদ্ধতা স্কোর' : 'Purity Grade'}</td>
                          <td className="p-2 text-right font-extrabold text-emerald-800">100% Premium Raw</td>
                        </tr>
                        <tr className="border-b border-stone-150">
                          <td className="p-2 font-bold text-stone-600">{lang === 'bn' ? 'যোগকৃত চিনি' : 'Added Sucrose'}</td>
                          <td className="p-2 text-right font-extrabold text-red-650">0.00% (Lab Checked)</td>
                        </tr>
                        <tr className="border-b border-stone-150 bg-stone-50">
                          <td className="p-2 font-bold text-stone-600">{lang === 'bn' ? 'আর্দ্রতা মান' : 'Moisture Ratio'}</td>
                          <td className="p-2 text-right font-extrabold text-stone-750">17.2% (Cold Cap)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-stone-600">{lang === 'bn' ? 'রাসায়নিক উপাদান' : 'Heavy Metal Residual'}</td>
                          <td className="p-2 text-right font-extrabold text-emerald-800">Not Detected</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'sourcing' && (
                <div className="space-y-4 text-xs md:text-sm text-stone-600">
                  <p className="font-semibold text-stone-900">
                    {lang === 'bn' ? 'লাইভ সোর্সিং ভিডিও প্রমাণ যাচাইকরণ:' : 'Video Proof Protocol of Direct Sourcing:'}
                  </p>
                  <p>
                    {lang === 'bn'
                      ? 'আমরা দাদাজানের পক্ষ থেকে প্রজেক্টের প্রতিটি পণ্যের স্বচ্ছ উৎপাদন ও প্যাকেজিং প্রক্রিয়া রানিং ভিডিও শ্যুট করে সংরক্ষণ করি।'
                      : 'At DADAJAN, we record and store live visual footage of the actual crop harvesting, raw processing, and packaging stages for every item we sell.'}
                  </p>
                  <div className="relative aspect-video max-w-md mx-auto bg-stone-900 rounded-xl overflow-hidden mt-4 shadow border border-stone-200">
                    <video src={product.videoUrl} className="w-full h-full object-cover" controls playsInline />
                  </div>
                </div>
              )}

              {activeTab === 'qa' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <div key={q.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/50 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-emerald-700" />
                            {q.user}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">{q.date}</span>
                        </div>
                        <p className="text-xs font-bold text-stone-700 pl-5.5">Q: {q.question}</p>
                        <p className="text-xs text-stone-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 pl-5.5 leading-relaxed">
                          {q.answer}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Ask question form */}
                  <form onSubmit={submitQuestion} className="border-t border-stone-150 pt-4 mt-6">
                    <h4 className="font-bold text-xs text-stone-950 mb-2 uppercase tracking-wide">
                      {lang === 'bn' ? 'পণ্য নিয়ে কোনো প্রশ্ন আছে? ইমাম বা ল্যাব টিমকে জিজ্ঞাসা করুন:' : 'Have a question? Ask our Scholars or Lab Team:'}
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={lang === 'bn' ? 'আপনার প্রশ্ন লিখুন (যেমন: মধু পানের সঠিক সুন্নাহ নিয়ম কি?)...' : 'Write your question here...'}
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none focus:border-emerald-700"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 rounded-xl text-xs cursor-pointer transition-colors shrink-0"
                      >
                        {lang === 'bn' ? 'জিজ্ঞাসা করুন' : 'Ask'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews & Feedback Block */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/60 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-display font-extrabold text-base text-stone-900">
                {lang === 'bn' ? 'পণ্য পর্যালোচনা ও ক্রেতা মন্তব্য' : 'Customer Reviews'}
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                ★ 5.0 Rating
              </span>
            </div>

            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-stone-100 pb-4 last:border-none last:pb-0 space-y-2 text-left">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-stone-850 text-xs block">{r.author}</span>
                      <span className="text-[10px] text-amber-700 font-extrabold">{r.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed italic bg-stone-50/50 p-3 rounded-xl border border-stone-150">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* Write a comment */}
            <form onSubmit={submitReview} className="p-4.5 bg-[#FAF9F5] border border-stone-150 rounded-2xl space-y-3.5">
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wide">
                {lang === 'bn' ? 'আপনার ব্যক্তিগত অভিজ্ঞতা শেয়ার করুন:' : 'Share Your Verified Experience:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{lang === 'bn' ? 'আপনার নাম:' : 'Your Name:'}</label>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'উদা: মোহাম্মাদ আবদুল্লাহ' : 'e.g. Mohammad Abdullah'}
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{lang === 'bn' ? 'রেটিং দিন:' : 'Rating Score:'}</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none font-bold"
                  >
                    <option value={5}>★★★★★ (5/5)</option>
                    <option value={4}>★★★★☆ (4/5)</option>
                    <option value={3}>★★★☆☆ (3/5)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">{lang === 'bn' ? 'রিভিউ লিখন:' : 'Your Comments:'}</label>
                <textarea
                  placeholder={lang === 'bn' ? 'পণ্যটির স্বাদ এবং প্যাক ভেরিফিকেশন কেমন ছিল বিস্তারিত লিখুন...' : 'Write your experience...'}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none min-h-[70px]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-750 hover:bg-emerald-800 text-white font-extrabold py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
              >
                {lang === 'bn' ? 'রিভিউ পোস্ট করুন' : 'Submit Review Record'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
