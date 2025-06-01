// 重置积分脚本
// 添加到页面中，重置本地存储中的积分为4点

(function() {
  console.log('检查并重置积分...');
  const storedPoints = localStorage.getItem('facetalk_points');
  
  // 检查是否有历史存储值
  if (storedPoints !== null) {
    const points = parseInt(storedPoints, 10);
    // 如果当前存储值是100，则重置为4
    if (points === 100) {
      console.log('检测到旧的积分值(100)，重置为4点');
      localStorage.setItem('facetalk_points', '4');
    } else {
      console.log('当前积分:', points);
    }
  } else {
    // 没有积分记录，设置为4
    console.log('未检测到积分记录，设置为4点');
    localStorage.setItem('facetalk_points', '4');
  }
  
  // 重置其他相关缓存
  const cacheKeys = [
    'facetalk_last_generation',
    'facetalk_generations',
    'facetalk_active_tasks'
  ];
  
  // 是否需要重新加载页面
  let needsReload = false;
  
  // 检查现有积分是否需要重置
  if (storedPoints === '100') {
    needsReload = true;
  }
  
  // 如果检测到任何旧的缓存值，重置它们
  cacheKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      needsReload = true;
    }
  });
  
  // 如果需要，重新加载页面以应用新的积分
  if (needsReload) {
    console.log('重置完成，重新加载页面...');
    window.location.reload();
  }
})(); 