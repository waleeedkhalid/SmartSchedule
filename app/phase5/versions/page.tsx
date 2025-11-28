/**
 * Phase 5 - Version Control Demo
 * 
 * Demonstrates:
 * - Named releases
 * - jsondiffpatch change tracking
 * - Version comparison
 * - Point-in-time restore
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  GitBranch,
  GitCommit,
  History,
  FileText,
  CheckCircle2,
  Plus,
  Minus,
  Edit3,
  Clock,
  User,
  Activity,
  GitCompare,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as jsondiffpatch from 'jsondiffpatch';

// Initialize jsondiffpatch
interface HashableObject {
  id?: string;
  code?: string;
}
const differ = jsondiffpatch.create({
  objectHash: (obj: HashableObject) => obj.id || obj.code || JSON.stringify(obj),
  arrays: {
    detectMove: true,
    includeValueOnMove: false
  }
});

// Sample schedule data for different versions
interface VersionData {
  courses: Array<{
    code: string;
    title: string;
    sections?: Array<{
      section_no: string;
      instructor?: string;
      room?: string;
    }>;
  }>;
  lastUpdated: string;
  status: string;
}
const versionData: Record<string, VersionData> = {
  'v1.0': {
    courses: [
      {
        code: 'SWE 211',
        title: 'Introduction to Software Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Ahmed', room: 'SWE-101', time: '10:00', capacity: 40 }
        ]
      },
      {
        code: 'SWE 314',
        title: 'Software Security Engineering',
        sections: [
          { id: '01L', instructor: 'TBD', room: 'SWE-201', time: '08:00', capacity: 35 }
        ]
      },
      {
        code: 'SWE 312',
        title: 'Software Requirements Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Fatima', room: 'SWE-203', time: '14:00', capacity: 40 }
        ]
      }
    ],
    metadata: {
      conflicts: 3,
      lastModified: '2025-10-27 14:00'
    }
  },
  'v1.1': {
    courses: [
      {
        code: 'SWE 211',
        title: 'Introduction to Software Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Sarah', room: 'SWE-105', time: '10:00', capacity: 40 }
        ]
      },
      {
        code: 'SWE 314',
        title: 'Software Security Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Mohammed', room: 'SWE-201', time: '13:00', capacity: 35 }
        ]
      },
      {
        code: 'SWE 312',
        title: 'Software Requirements Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Fatima', room: 'SWE-203', time: '08:00', capacity: 40 }
        ]
      },
      {
        code: 'SWE 321',
        title: 'Software Design and Architecture',
        sections: [
          { id: '01L', instructor: 'Dr. Nora', room: 'SWE-301', time: '09:00', capacity: 40 }
        ]
      }
    ],
    metadata: {
      conflicts: 1,
      lastModified: '2025-10-28 11:20'
    }
  },
  'rc1': {
    courses: [
      {
        code: 'SWE 211',
        title: 'Introduction to Software Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Sarah', room: 'SWE-105', time: '10:00', capacity: 45 }
        ]
      },
      {
        code: 'SWE 314',
        title: 'Software Security Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Mohammed', room: 'SWE-201', time: '13:00', capacity: 35 }
        ]
      },
      {
        code: 'SWE 312',
        title: 'Software Requirements Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Fatima', room: 'SWE-204', time: '08:00', capacity: 40 }
        ]
      },
      {
        code: 'SWE 321',
        title: 'Software Design and Architecture',
        sections: [
          { id: '01L', instructor: 'Dr. Nora', room: 'SWE-301', time: '09:00', capacity: 40 },
          { id: '02L', instructor: 'Dr. Nora', room: 'SWE-302', time: '11:00', capacity: 35 }
        ]
      }
    ],
    metadata: {
      conflicts: 0,
      lastModified: '2025-10-28 16:45'
    }
  },
  'rc2': {
    courses: [
      {
        code: 'SWE 211',
        title: 'Introduction to Software Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Sarah', room: 'SWE-105', time: '10:00', capacity: 45 }
        ]
      },
      {
        code: 'SWE 314',
        title: 'Software Security Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Mohammed', room: 'SWE-201', time: '13:00', capacity: 35 }
        ]
      },
      {
        code: 'SWE 312',
        title: 'Software Requirements Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Fatima', room: 'SWE-204', time: '08:00', capacity: 42 }
        ]
      },
      {
        code: 'SWE 321',
        title: 'Software Design and Architecture',
        sections: [
          { id: '01L', instructor: 'Dr. Nora', room: 'SWE-301', time: '09:00', capacity: 40 },
          { id: '02L', instructor: 'Dr. Khalid', room: 'SWE-302', time: '11:00', capacity: 35 }
        ]
      }
    ],
    metadata: {
      conflicts: 0,
      lastModified: '2025-10-29 10:15'
    }
  },
  'final': {
    courses: [
      {
        code: 'SWE 211',
        title: 'Introduction to Software Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Sarah Al-Mansour', room: 'SWE-105', time: '10:00', capacity: 45 }
        ]
      },
      {
        code: 'SWE 314',
        title: 'Software Security Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Mohammed Al-Qahtani', room: 'SWE-201', time: '13:00', capacity: 35 }
        ]
      },
      {
        code: 'SWE 312',
        title: 'Software Requirements Engineering',
        sections: [
          { id: '01L', instructor: 'Dr. Fatima Al-Dosari', room: 'SWE-204', time: '08:00', capacity: 42 }
        ]
      },
      {
        code: 'SWE 321',
        title: 'Software Design and Architecture',
        sections: [
          { id: '01L', instructor: 'Dr. Nora Al-Shehri', room: 'SWE-301', time: '09:00', capacity: 40 },
          { id: '02L', instructor: 'Dr. Khalid Al-Harbi', room: 'SWE-302', time: '11:00', capacity: 35 }
        ]
      }
    ],
    metadata: {
      conflicts: 0,
      lastModified: '2025-10-29 14:30',
      published: true
    }
  }
};

export default function VersionsPage() {
  const [selectedVersion, setSelectedVersion] = useState('v1.1');
  const [compareVersion, setCompareVersion] = useState<string>('v1.0');
  const [showComparison, setShowComparison] = useState(false);

  // Simulated version history
  const versions = useMemo(() => [
    {
      id: 'final',
      tag: 'Final',
      date: '2025-10-29 14:30',
      author: 'Registrar',
      published: true,
      description: 'Published schedule for Fall 2025',
    },
    {
      id: 'rc2',
      tag: 'RC2',
      date: '2025-10-29 10:15',
      author: 'Dr. Ahmed (Scheduling)',
      published: false,
      description: 'Fixed 2 remaining conflicts',
    },
    {
      id: 'rc1',
      tag: 'RC1',
      date: '2025-10-28 16:45',
      author: 'Dr. Fatima (Teaching Load)',
      published: false,
      description: 'Release candidate - ready for review',
    },
    {
      id: 'v1.1',
      tag: 'Draft v1.1',
      date: '2025-10-28 11:20',
      author: 'Dr. Ahmed (Scheduling)',
      published: false,
      description: 'Adjusted instructor assignments',
    },
    {
      id: 'v1.0',
      tag: 'Draft v1.0',
      date: '2025-10-27 14:00',
      author: 'Dr. Ahmed (Scheduling)',
      published: false,
      description: 'Initial schedule draft',
    },
  ], []);

  // Compute diff between selected version and previous
  const diff = useMemo(() => {
    const currentIndex = versions.findIndex(v => v.id === selectedVersion);
    const previousVersion = versions[currentIndex + 1];
    
    if (!previousVersion) return null;
    
    const leftData = versionData[previousVersion.id];
    const rightData = versionData[selectedVersion];
    
    return differ.diff(leftData, rightData);
  }, [selectedVersion, versions]);

  // Compute diff for comparison mode
  const comparisonDiff = useMemo(() => {
    if (!showComparison || !compareVersion) return null;
    
    const leftData = versionData[compareVersion];
    const rightData = versionData[selectedVersion];
    
    return differ.diff(leftData, rightData);
  }, [selectedVersion, compareVersion, showComparison]);

  // Count changes in diff
  const countChanges = (diffObj: unknown) => {
    if (!diffObj) return { added: 0, modified: 0, deleted: 0 };
    
    let added = 0, modified = 0, deleted = 0;
    
    const traverse = (obj: unknown) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (Array.isArray(value)) {
          if (value.length === 1) {
            added++;
          } else if (value.length === 2) {
            modified++;
          } else if (value.length === 3 && value[2] === 0) {
            deleted++;
          }
        } else if (typeof value === 'object') {
          traverse(value);
        }
      });
    };
    
    traverse(diffObj);
    return { added, modified, deleted };
  };

  const changes = countChanges(showComparison ? comparisonDiff : diff);

  // Render diff recursively
  const renderDiff = (diffObj: unknown, path: string = '', level: number = 0): React.ReactElement[] => {
    if (!diffObj || typeof diffObj !== 'object') return [];
    
    const entries: React.ReactElement[] = [];
    
    Object.keys(diffObj).forEach((key, idx) => {
      const value = diffObj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      // Skip internal jsondiffpatch keys
      if (key === '_t') return;
      
      // Array with one element = addition
      if (Array.isArray(value) && value.length === 1) {
        entries.push(
          <motion.div
            key={`${currentPath}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-lg border-l-4 bg-green-50 border-green-500 hover:shadow-md transition-all"
            style={{ marginLeft: `${level * 16}px` }}
          >
            <div className="flex items-start gap-2">
              <Plus className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                    Added
                  </Badge>
                  <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded break-all">
                    {currentPath}
                  </code>
                </div>
                <pre className="text-xs font-mono text-green-700 bg-green-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(value[0], null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        );
      }
      // Array with two elements = modification
      else if (Array.isArray(value) && value.length === 2) {
        entries.push(
          <motion.div
            key={`${currentPath}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-lg border-l-4 bg-yellow-50 border-yellow-500 hover:shadow-md transition-all"
            style={{ marginLeft: `${level * 16}px` }}
          >
            <div className="flex items-start gap-2">
              <Edit3 className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                    Modified
                  </Badge>
                  <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded break-all">
                    {currentPath}
                  </code>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Minus className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                    <pre className="text-xs font-mono text-red-700 bg-red-100 p-2 rounded flex-1 overflow-x-auto">
                      {JSON.stringify(value[0], null, 2)}
                    </pre>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-auto" />
                  <div className="flex items-start gap-2">
                    <Plus className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                    <pre className="text-xs font-mono text-green-700 bg-green-100 p-2 rounded flex-1 overflow-x-auto">
                      {JSON.stringify(value[1], null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      }
      // Array with three elements where [2] === 0 = deletion
      else if (Array.isArray(value) && value.length === 3 && value[2] === 0) {
        entries.push(
          <motion.div
            key={`${currentPath}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-lg border-l-4 bg-red-50 border-red-500 hover:shadow-md transition-all"
            style={{ marginLeft: `${level * 16}px` }}
          >
            <div className="flex items-start gap-2">
              <Minus className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                    Deleted
                  </Badge>
                  <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded break-all">
                    {currentPath}
                  </code>
                </div>
                <pre className="text-xs font-mono text-red-700 bg-red-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(value[0], null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        );
      }
      // Nested object = recurse
      else if (typeof value === 'object' && !Array.isArray(value)) {
        entries.push(...renderDiff(value, currentPath, level + 1));
      }
    });
    
    return entries;
  };

  const diffElements = renderDiff(showComparison ? comparisonDiff : diff);

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
            <Button variant="ghost" size="sm" className="mb-2 hover:bg-muted transition-colors" aria-label="Back to Phase 5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Phase 5
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Version Control with jsondiffpatch
          </h1>
          <p className="text-muted-foreground">
            Real-time schedule diff tracking and version comparison
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-purple-100 text-purple-900 border-purple-200">
          <GitBranch className="h-4 w-4 mr-2" />
          {versions.length} Versions
        </Badge>
      </motion.div>

      {/* Current Version Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    {versions[0].tag} - Published Schedule
                  </h3>
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <User className="h-3 w-3" />
                    <span>{versions[0].author}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{versions[0].date}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="hover:bg-green-100 transition-colors" aria-label="Export schedule">
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comparison Mode Toggle */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <GitCompare className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Comparison Mode Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Compare:</span>
                    <Select value={compareVersion} onValueChange={setCompareVersion}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {versions
                          .filter(v => v.id !== selectedVersion)
                          .map(v => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.tag}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">→</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-900">
                      {versions.find(v => v.id === selectedVersion)?.tag}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Version History with Timeline */}
        <div className="md:col-span-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600" />
                  Version History
                </CardTitle>
                <CardDescription>
                  Select version to view diff
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative space-y-3">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-pink-200 to-purple-200" />
                  
                  <AnimatePresence mode="popLayout">
                    {versions.map((version, idx) => (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedVersion === version.id
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg scale-[1.02]'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-muted/50 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedVersion(version.id)}
                        whileHover={{ x: 4 }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select version ${version.tag}`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') setSelectedVersion(version.id);
                        }}
                      >
                        {/* Timeline dot */}
                        <motion.div 
                          className={`absolute left-[-38px] top-6 w-4 h-4 rounded-full border-2 ${
                            version.published 
                              ? 'bg-green-500 border-green-600' 
                              : selectedVersion === version.id
                                ? 'bg-purple-500 border-purple-600'
                                : 'bg-white border-purple-300'
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + idx * 0.1, type: 'spring' }}
                        />
                        
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <GitCommit className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              selectedVersion === version.id ? 'text-purple-600' : 'text-muted-foreground'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`font-semibold text-sm ${
                                  selectedVersion === version.id ? 'text-purple-900' : ''
                                }`}>
                                  {version.tag}
                                </span>
                                {version.published && (
                                  <Badge variant="default" className="text-xs bg-green-600">
                                    Published
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {version.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <Clock className="h-3 w-3" />
                                <span>{version.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* JSON Diff Viewer */}
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-purple-600" />
                      {showComparison ? 'Version Comparison' : 'Change Details'}
                    </CardTitle>
                    <CardDescription>
                      {showComparison 
                        ? `Comparing ${versions.find(v => v.id === compareVersion)?.tag} → ${versions.find(v => v.id === selectedVersion)?.tag}`
                        : `Changes in ${versions.find(v => v.id === selectedVersion)?.tag} vs previous`
                      }
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={showComparison ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowComparison(!showComparison)}
                      className={showComparison ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}
                    >
                      <GitCompare className="h-4 w-4 mr-2" />
                      {showComparison ? 'Disable' : 'Enable'} Compare
                    </Button>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        +{changes.added}
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        ~{changes.modified}
                      </Badge>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        -{changes.deleted}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedVersion}-${compareVersion}-${showComparison}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 max-h-[600px] overflow-y-auto"
                  >
                    {!showComparison && !diff ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">This is the first version</p>
                        <p className="text-sm mt-2">No previous version to compare with</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => setShowComparison(true)}
                        >
                          <GitCompare className="h-4 w-4 mr-2" />
                          Enable Comparison Mode
                        </Button>
                      </div>
                    ) : diffElements && diffElements.length > 0 ? (
                      diffElements
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-semibold">No changes detected</p>
                        <p className="text-sm mt-2">Versions are identical</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Version Control Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card className="shadow-lg border-2 bg-gradient-to-br from-white to-purple-50/20">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              jsondiffpatch Features
            </CardTitle>
            <CardDescription>
              Powered by jsondiffpatch for precise JSON comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                className="space-y-3 hover:scale-105 transition-transform"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <GitBranch className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-900">Deep Comparison</h4>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Nested object diffs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Array change detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Object hash matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Move detection</span>
                  </li>
                </ul>
              </motion.div>
              <motion.div 
                className="space-y-3 hover:scale-105 transition-transform"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Edit3 className="h-4 w-4 text-pink-600" />
                  </div>
                  <h4 className="font-semibold text-pink-900">Visual Diff</h4>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    <span>Color-coded changes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    <span>Before/after preview</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    <span>Field-level tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                    <span>JSON path display</span>
                  </li>
                </ul>
              </motion.div>
              <motion.div 
                className="space-y-3 hover:scale-105 transition-transform"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <GitCompare className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-900">Comparison</h4>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Any version vs any version</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Change statistics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Real JSON data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Instant diff computation</span>
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
