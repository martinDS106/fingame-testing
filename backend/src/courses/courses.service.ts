import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(topic?: string) {
    const where = topic && topic !== 'all' ? { topic } : undefined;
    return this.prisma.course.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async byId(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            videos: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}
