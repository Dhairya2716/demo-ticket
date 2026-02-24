import {
    Controller,
    Get,
    Post,
    Body,
    Param,
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
        @Request() req,
    ) {
        return this.commentsService.addComment(+ticketId, createCommentDto, req.user);
    }

    @Get('tickets/:ticketId/comments')
    getAll(@Param('ticketId') ticketId: string, @Request() req) {
        return this.commentsService.getCommentsByTicket(+ticketId, req.user);
    }
}
