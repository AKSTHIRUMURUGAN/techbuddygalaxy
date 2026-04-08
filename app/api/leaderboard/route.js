import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections, calculateRankScore } from '@/lib/models';
import { ObjectId } from 'mongodb';

// GET - Fetch leaderboard
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const period = searchParams.get('period'); // 'weekly', 'monthly', 'all'
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const performanceCollection = await getCollection(Collections.PERFORMANCE);
    const usersCollection = await getCollection(Collections.USERS);
    
    // Fetch all performance records
    let performances = await performanceCollection.find({}).toArray();
    
    // Filter by position if specified
    if (position) {
      const users = await usersCollection.find({ role: position }).toArray();
      const userIds = users.map(u => u._id.toString());
      performances = performances.filter(p => userIds.includes(p.userId));
    }
    
    // Calculate rank scores
    const leaderboard = performances.map(p => ({
      ...p,
      rankScore: calculateRankScore(
        p.performanceScore,
        p.tasksCompleted,
        p.consistencyScore
      ),
    }));
    
    // Sort by rank score
    leaderboard.sort((a, b) => b.rankScore - a.rankScore);
    
    // Add rank numbers
    const rankedLeaderboard = leaderboard.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
    
    // Fetch user details
    const userIds = rankedLeaderboard.map(l => l.userId);
    const users = await usersCollection
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .toArray();
    
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u;
    });
    
    // Combine data
    const finalLeaderboard = rankedLeaderboard.map(entry => ({
      rank: entry.rank,
      userId: entry.userId,
      name: userMap[entry.userId]?.name || 'Unknown',
      department: userMap[entry.userId]?.department || 'N/A',
      profileImage: userMap[entry.userId]?.profileImage || null,
      performanceScore: entry.performanceScore,
      tasksCompleted: entry.tasksCompleted,
      rankScore: parseFloat(entry.rankScore.toFixed(2)),
    }));
    
    return NextResponse.json({
      success: true,
      leaderboard: finalLeaderboard,
      period: period || 'all',
      position: position || 'all',
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
