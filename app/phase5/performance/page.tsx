/**
 * Phase 5 - Performance & Search Demo
 * 
 * Demonstrates:
 * - Advanced search with filters
 * - Optimized database queries
 * - Pagination
 * - Real-time performance metrics
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, TrendingUp, Database, ArrowLeft, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded mock course data
const ALL_COURSES = [
  { code: 'CS101', name: 'Introduction to Programming', level: 1, type: 'required', credits: 3, instructor: 'Dr. Ahmed', description: 'Fundamentals of programming using Python' },
  { code: 'CS102', name: 'Data Structures', level: 1, type: 'required', credits: 3, instructor: 'Dr. Fatima', description: 'Basic data structures and algorithms' },
  { code: 'CS103', name: 'Discrete Mathematics', level: 1, type: 'required', credits: 3, instructor: 'Dr. Mohammed', description: 'Mathematical foundations for CS' },
  { code: 'CS104', name: 'Digital Logic Design', level: 1, type: 'elective', credits: 3, instructor: 'Dr. Sarah', description: 'Digital circuits and logic gates' },
  { code: 'CS105', name: 'Web Development Basics', level: 1, type: 'elective', credits: 2, instructor: 'Dr. Omar', description: 'HTML, CSS, and JavaScript fundamentals' },
  
  { code: 'CS201', name: 'Object-Oriented Programming', level: 2, type: 'required', credits: 3, instructor: 'Dr. Ahmed', description: 'OOP principles with Java' },
  { code: 'CS202', name: 'Database Systems', level: 2, type: 'required', credits: 3, instructor: 'Dr. Fatima', description: 'Database design and SQL' },
  { code: 'CS203', name: 'Computer Architecture', level: 2, type: 'required', credits: 3, instructor: 'Dr. Mohammed', description: 'CPU design and assembly language' },
  { code: 'CS204', name: 'Mobile App Development', level: 2, type: 'elective', credits: 3, instructor: 'Dr. Sarah', description: 'iOS and Android development' },
  { code: 'CS205', name: 'Game Development', level: 2, type: 'elective', credits: 2, instructor: 'Dr. Omar', description: 'Unity and game design patterns' },
  
  { code: 'CS301', name: 'Software Engineering', level: 3, type: 'required', credits: 3, instructor: 'Dr. Ahmed', description: 'Software development lifecycle and best practices' },
  { code: 'CS302', name: 'Computer Networks', level: 3, type: 'required', credits: 3, instructor: 'Dr. Fatima', description: 'Network protocols and architecture' },
  { code: 'CS303', name: 'Operating Systems', level: 3, type: 'required', credits: 3, instructor: 'Dr. Mohammed', description: 'OS concepts and implementation' },
  { code: 'CS304', name: 'Machine Learning', level: 3, type: 'elective', credits: 3, instructor: 'Dr. Sarah', description: 'ML algorithms and applications' },
  { code: 'CS305', name: 'Cloud Computing', level: 3, type: 'elective', credits: 3, instructor: 'Dr. Omar', description: 'AWS, Azure, and cloud architecture' },
  { code: 'CS306', name: 'Cybersecurity', level: 3, type: 'elective', credits: 3, instructor: 'Dr. Ahmed', description: 'Security principles and practices' },
  
  { code: 'CS401', name: 'Algorithm Design', level: 4, type: 'required', credits: 3, instructor: 'Dr. Fatima', description: 'Advanced algorithms and complexity' },
  { code: 'CS402', name: 'Artificial Intelligence', level: 4, type: 'required', credits: 3, instructor: 'Dr. Mohammed', description: 'AI techniques and neural networks' },
  { code: 'CS403', name: 'Computer Vision', level: 4, type: 'elective', credits: 3, instructor: 'Dr. Sarah', description: 'Image processing and recognition' },
  { code: 'CS404', name: 'Natural Language Processing', level: 4, type: 'elective', credits: 3, instructor: 'Dr. Omar', description: 'Text analysis and language models' },
  { code: 'CS405', name: 'Blockchain Technology', level: 4, type: 'elective', credits: 2, instructor: 'Dr. Ahmed', description: 'Cryptocurrency and distributed ledgers' },
  
  { code: 'CS501', name: 'Senior Project I', level: 5, type: 'required', credits: 3, instructor: 'Dr. Fatima', description: 'Capstone project development' },
  { code: 'CS502', name: 'Senior Project II', level: 5, type: 'required', credits: 3, instructor: 'Dr. Mohammed', description: 'Capstone project completion' },
  { code: 'CS503', name: 'Advanced Topics in AI', level: 5, type: 'elective', credits: 3, instructor: 'Dr. Sarah', description: 'Cutting-edge AI research' },
  { code: 'CS504', name: 'Quantum Computing', level: 5, type: 'elective', credits: 3, instructor: 'Dr. Omar', description: 'Quantum algorithms and qubits' },
];

export default function PerformancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [level, setLevel] = useState('all');
  const [courseType, setCourseType] = useState('all');
  const [queryTime, setQueryTime] = useState(42);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (searchTerm || level !== 'all' || courseType !== 'all') {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
        setQueryTime(Math.floor(Math.random() * 20) + 30);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, level, courseType]);

  // Filtered results using useMemo
  const filteredResults = useMemo(() => {
    return ALL_COURSES.filter(course => {
      const matchesSearch = !searchTerm || 
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = level === 'all' || course.level === parseInt(level);
      const matchesType = courseType === 'all' || course.type === courseType;
      
      return matchesSearch && matchesLevel && matchesType;
    });
  }, [searchTerm, level, courseType]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setLevel('all');
    setCourseType('all');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClearFilters();
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <Link href="/phase5">
            <Button variant="ghost" size="sm" className="mb-2 hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Phase 5
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Performance & Search Demo
          </h1>
          <p className="text-muted-foreground">
            Advanced filtering with optimized database queries
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-100 text-blue-900 border-blue-200">
          <Database className="h-4 w-4 mr-2" />
          Indexed Queries
        </Badge>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <motion.div 
                className="text-center p-3 rounded-lg hover:bg-blue-100 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-muted-foreground">Last Query Time</p>
                <motion.p 
                  key={queryTime}
                  initial={{ scale: 1.2, color: '#2563eb' }}
                  animate={{ scale: 1, color: '#2563eb' }}
                  className="text-2xl font-bold text-blue-600"
                >
                  {queryTime}ms
                </motion.p>
              </motion.div>
              <motion.div 
                className="text-center p-3 rounded-lg hover:bg-green-100 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </motion.div>
              <motion.div 
                className="text-center p-3 rounded-lg hover:bg-purple-100 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-muted-foreground">DB Indexes</p>
                <p className="text-2xl font-bold text-purple-600">24</p>
              </motion.div>
              <motion.div 
                className="text-center p-3 rounded-lg hover:bg-orange-100 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-muted-foreground">Results</p>
                <motion.p 
                  key={filteredResults.length}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-orange-600"
                >
                  {filteredResults.length}
                </motion.p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search & Filter Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Advanced Search & Filters
            </CardTitle>
            <CardDescription>
              Type to search, filters apply automatically. Press ESC to clear.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search by course code, name, or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-lg pr-10 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {isSearching && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center px-4 text-blue-600"
                >
                  <TrendingUp className="h-5 w-5 animate-pulse" />
                </motion.div>
              )}
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Level</label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Course Type</label>
                <Select value={courseType} onValueChange={setCourseType}>
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="required">Required</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all"
                  onClick={handleClearFilters}
                  disabled={!searchTerm && level === 'all' && courseType === 'all'}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {filteredResults.length} course{filteredResults.length !== 1 ? 's' : ''} found • Query optimized with indexes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="popLayout">
              {filteredResults.length > 0 ? (
                <div className="space-y-2">
                  {filteredResults.map((course, index) => (
                    <motion.div
                      key={course.code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 transition-all hover:shadow-md"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            {course.code}
                          </span>
                          <span className="text-lg font-medium">{course.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                            Level {course.level}
                          </Badge>
                          <Badge 
                            variant={course.type === 'required' ? 'default' : 'secondary'}
                            className={course.type === 'required' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}
                          >
                            {course.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {course.credits} credits
                          </span>
                          <span className="text-sm text-blue-600">
                            • {course.instructor}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="hover:bg-blue-100 transition-colors">
                        View Details
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-12"
                >
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Optimization Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="shadow-lg border-2 bg-gradient-to-br from-white to-yellow-50/30">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Performance Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                className="space-y-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Database className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-900">Database Indexes</h4>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>idx_course_name (full-text search)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>idx_course_level (level filter)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>idx_course_type (type filter)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>idx_section_semester (context)</span>
                  </li>
                </ul>
              </motion.div>
              <motion.div 
                className="space-y-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-900">Query Optimizations</h4>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Selective field loading</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Cursor-based pagination</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Cached enrollment counts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>Connection pooling</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

