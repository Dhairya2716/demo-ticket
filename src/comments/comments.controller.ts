import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('tickets/:ticketId/comments')
    @HttpCode(HttpStatus.CREATED)
    create(
        @Param('ticketId') ticketId: string,
        @Body() createCommentDto: CreateCommentDto,
        @Request() req
    ) {
        return this.commentsService.create(+ticketId, createCommentDto, req.user);
    }

    @Get('tickets/:ticketId/comments')
    findAllByTicket(@Param('ticketId') ticketId: string, @Request() req) {
        return this.commentsService.findAllByTicket(+ticketId, req.user);
    }

    @Patch('comments/:id')
    update(
        @Param('id') id: string,
        @Body() createCommentDto: CreateCommentDto,
        @Request() req
    ) {
        return this.commentsService.update(+id, createCommentDto, req.user);
    }

    @Delete('comments/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Request() req): Promise<void> {
        await this.commentsService.remove(+id, req.user);
    }
}
