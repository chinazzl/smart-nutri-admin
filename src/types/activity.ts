// 运动模块相关类型定义

export interface Exercise {
  id: string;
  name: string;
  category: string;  // 'cardio' | 'strength' | 'flexibility' | 'stretch'
  met: number;       // 代谢当量系数（安静坐姿时的倍数）
  description?: string;
  icon?: string;
}

export interface ActivityLog {
  id: string;
  date: string;        // YYYY-MM-DD
  exercise: Exercise;
  duration: number;     // 分钟
  calories: number;     // 计算后的消耗千卡
  createdAt: string;
  updatedAt: string;
}

export interface StretchSession {
  id: string;
  date: string;
  name: string;        // 如 '肩颈舒缓拉伸'
  duration: number;    // 秒
  calories: number;    // 固定 15 kcal
  completedAt: string;
}

export interface DayActivitySummary {
  date: string;
  totalDuration: number;   // 总分钟数
  totalCalories: number;   // 总消耗千卡
  exercises: ActivityLog[];
  stretches: StretchSession[];
}

export interface ActivityData {
  [date: string]: DayActivitySummary;
}

// 内置运动库（MET值参考《中国居民膳食营养素参考摄入量》及Compendium of Physical Activities）
export const BUILTIN_EXERCISES: Exercise[] = [
  { id: 'walk-slow', name: '散步（慢走）', category: 'cardio', met: 3.0, description: '悠闲步行 3km/h' },
  { id: 'walk-fast', name: '快走', category: 'cardio', met: 4.3, description: '快速步行 5-6km/h' },
  { id: 'jog', name: '慢跑', category: 'cardio', met: 7.0, description: '慢速跑步 8km/h' },
  { id: 'run', name: '跑步', category: 'cardio', met: 9.8, description: '中速跑步 10km/h' },
  { id: 'bike', name: '骑行', category: 'cardio', met: 6.8, description: '户外骑行 16km/h' },
  { id: 'swim', name: '游泳', category: 'cardio', met: 8.0, description: '自由泳中等速度' },
  { id: 'jump-rope', name: '跳绳', category: 'cardio', met: 11.8, description: '中等速度跳绳' },
  { id: 'yoga', name: '瑜伽', category: 'flexibility', met: 2.5, description: '哈他瑜伽' },
  { id: 'pilates', name: '普拉提', category: 'strength', met: 4.0, description: '中等强度' },
  { id: 'strength', name: '力量训练', category: 'strength', met: 5.0, description: '中等重量器械训练' },
  { id: 'dancing', name: '跳舞', category: 'cardio', met: 5.5, description: '中等强度舞蹈' },
  { id: 'badminton', name: '羽毛球', category: 'cardio', met: 5.5, description: '双打休闲' },
  { id: 'basketball', name: '篮球', category: 'cardio', met: 8.0, description: '半场对抗' },
];

// 内置拉伸项目
export interface StretchItem {
  id: string;
  name: string;
  nameEn: string;
  duration: number;  // 秒
  calories: number;  // 固定消耗
  description: string;
  steps: string[];
  icon: string;
}

export const BUILTIN_STRETCHES: StretchItem[] = [
  {
    id: 'neck-shoulder',
    name: '肩颈舒缓拉伸',
    nameEn: 'Neck & Shoulder Release',
    duration: 60,
    calories: 15,
    description: '针对久坐办公人群，缓解颈肩僵硬',
    steps: [
      '缓缓将头向右侧倾斜，保持右肩下沉',
      '将右手轻轻按在左耳上方，稍微加深拉伸',
      '保持 15 秒后换另一侧',
      '最后做头部缓慢旋转放松',
    ],
    icon: 'User',
  },
  {
    id: 'back-stretch',
    name: '腰背舒展',
    nameEn: 'Lower Back Stretch',
    duration: 60,
    calories: 15,
    description: '缓解久坐导致的腰部酸痛',
    steps: [
      '坐在椅子边缘，双脚平放地面',
      '双手放在膝盖上，轻轻向前弯腰',
      '感受下背部肌肉的伸展',
      '保持 20 秒，重复 2-3 次',
    ],
    icon: 'Cpu',
  },
  {
    id: 'leg-relief',
    name: '腿部松解',
    nameEn: 'Leg Relief Stretch',
    duration: 60,
    calories: 15,
    description: '促进下肢血液循环',
    steps: [
      '坐在椅子上，抬起右腿伸直',
      '脚尖向上勾起，保持 15 秒',
      '缓缓放下，换左腿重复',
      '双脚交替做踮脚尖动作 10 次',
    ],
    icon: 'TrendCharts',
  },
  {
    id: 'wrist-eye',
    name: '腕眼放松',
    nameEn: 'Wrist & Eye Relax',
    duration: 60,
    calories: 10,
    description: '缓解鼠标手和眼睛疲劳',
    steps: [
      '握拳后松开，快速重复 10 次',
      '手腕缓慢画圈，正反各 5 圈',
      '双手搓热后轻敷双眼',
      '眼球缓慢转动，顺逆各 5 圈',
    ],
    icon: 'View',
  },
];

export function calcCalories(exercise: Exercise, weight: number, duration: number): number {
  // 公式：MET × 体重(kg) × 时间(h)
  return Math.round(exercise.met * weight * (duration / 60));
}
