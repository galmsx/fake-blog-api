import {
    Controller,
    Inject,
    Get,
} from '@nestjs/common';
import { AuthRPC } from '@local/grpc-lib';
import { AUTH_SERVICE, COMMENT_SERVICE, POST_SERVICE, USER_SERVICE } from '../constants';
import { UserRPC, CommentRPC, PostRPC } from '@local/grpc-lib';

@Controller('/health-check')
export class HealthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: AuthRPC.AuthService,
        @Inject(POST_SERVICE) private readonly postService: PostRPC.PostService,
        @Inject(USER_SERVICE)
        private readonly userService: UserRPC.UserService,
        @Inject(COMMENT_SERVICE)
        private readonly commentService: CommentRPC.CommentService,

    ) { }

    @Get()
    async healthCheck() {
        const measureExecutionTime = async (serviceCall, serviceName) => {
            const startTime = Date.now();
            try {
                await serviceCall();
                return {
                    service: serviceName,
                    status: 'success',
                    duration: Date.now() - startTime,
                };
            } catch (error) {
                return {
                    service: serviceName,
                    status: 'failure',
                    error: error.message || error, 
                    duration: Date.now() - startTime, 
                };
            }
        };


        return Promise.allSettled([
            measureExecutionTime(() => this.authService.healthCheck(), 'authService'),
            measureExecutionTime(() => this.postService.healthCheck(), 'postService'),
            measureExecutionTime(() => this.userService.healthCheck(), 'userService'),
            measureExecutionTime(() => this.commentService.healthCheck(), 'commentService'),
        ]).then(res => res.map(result => {
            if (result.status === 'fulfilled') {
                return result.value; 
            } else {
                return {
                    service: 'unknown',
                    status: 'failure',
                    error: result.reason,
                    duration: 0,
                };
            }
        }))

    }
}