import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @ApiQuery({
    name: 'topic',
    required: false,
    description:
      'Optional topic filter (e.g. investing, budgeting, saving). Use "all" or omit for all.',
    example: 'investing',
  })
  list(@Query('topic') topic?: string) {
    return this.courses.list(topic);
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.courses.byId(id);
  }
}
